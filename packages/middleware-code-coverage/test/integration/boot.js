import test from "ava";
import path from "node:path";
import getPort from "get-port";
import request from "supertest";
import {spawn} from "node:child_process";

const baseConfigPath = "test/integration/fixtures/config/";

let install;

function exec(command, args=[]) {
	return spawn(command, args, {
		shell: true,
		cwd: "test/integration/fixtures/ui5-app/"
	});
}

function setup() {
	if (!install) {
		const child = exec("npm i --install-links=false");

		install = new Promise( (resolve) => {
			child.on("close", resolve);
		});
	}
	return install;
}

function startUI5Server(configPath, port) {
	const child = exec(`npm start`, [
		`-- --config ${configPath} --port ${port}`,
	]);

	return new Promise( (resolve, reject) => {
		const onError = () => {
			reject(new Error("Start of UI5 Server failed."));
		};
		const onSuccess = (data) => {
			data = data ? data.toString() : "";

			console.log("stdout:" + data + ":");

			if (data.startsWith("URL: http://localhost:")) {
				resolve();
			} else if (data.startsWith("Process Failed With Error")) {
				onError();
			}
		};

		child.stdout.on("data", onSuccess);
		child.stderr.on("data", (data) => {
			data = data ? data.toString() : "";
			console.log("stderr:" + data + ":");
		});
		child.on("close", onError);
	});
}

async function startUI5App(config = "./ui5.yaml") {
	const configPath = path.resolve(config);
	const port = await getPort();

	await startUI5Server(configPath, port);

	const app = request(`http://localhost:${port}`);
	return {app};
}

test.before(async (t) => {
	t.timeout(500000);
	await setup();
});

test.serial("Ping endpoint is up and running", async (t) => {
	const {app} = await startUI5App(baseConfigPath + "ui5-simple.yaml");

	const pingResponse = await app.get("/.ui5/coverage/ping");
	t.is(pingResponse.status, 200, "Ping was successful");
	t.is(pingResponse.type, "application/json", "Content-Type is correct");
	t.truthy(pingResponse.body.version, "Version is valid");
});

test.serial("Send coverage report", async (t) => {
	const {app} = await startUI5App(baseConfigPath + "ui5-simple.yaml");

	// TODO: send valid content to the report endpoint and check result
	const reportResponse = await app.post("/.ui5/coverage/report");

	t.is(reportResponse.type, "application/json", "Content-Type is correct");
});
