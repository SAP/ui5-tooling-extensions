import test from "ava";
import path from "node:path";
import {fileURLToPath} from "node:url";
import getPort from "get-port";
import request from "supertest";
import {execa} from "execa";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_TIMEOUT = 5 * 60 * 1000; // 5 minutes

let install;

function exec(command, args=[]) {
	return execa(command, args, {
		shell: true,
		cwd: path.join(__dirname, "fixtures", "ui5-app")
	})
		.pipeStdout(process.stdout)
		.pipeStderr(process.stderr);
}

function setup() {
	if (!install) {
		install = exec("npm i --install-links=false");
	}
	return install;
}

function startUI5Server(configPath, port) {
	const child = exec("npm start", ["--", "--config", configPath, "--port", port]);

	return new Promise( (resolve, reject) => {
		const onError = (errMessage = "Start of UI5 Server failed.") => {
			endUI5App(child); // Kill the process
			reject(new Error(errMessage));
		};
		const onSuccess = (data) => {
			data = data ? data.toString() : "";
			if (data.includes("URL: http://localhost:")) {
				resolve({proc: child});
			} else if (data.includes("Process Failed With Error")) {
				onError();
			}
		};

		child.stdout.on("data", onSuccess);
		child.on("close", onError);
		// Put timeout, so if some message is missed,
		// the test would fail instead of hanging.
		setTimeout(() => onError("Test timed out"), TEST_TIMEOUT);
	});
}

async function startUI5App(config = "./ui5.yaml") {
	const configPath = path.resolve(config);
	const port = await getPort();

	const {proc} = await startUI5Server(configPath, port);

	const app = request(`http://localhost:${port}`);
	return {app, proc};
}

function endUI5App(proc) {
	proc.stdout.pause();
	proc.kill();
}

test.before(async (t) => {
	t.timeout(500000);
	await setup();

	const {app, proc} = await startUI5App(path.join(__dirname, "fixtures", "config", "ui5-simple.yaml"));
	t.context.app = app;
	t.context.proc = proc;
});

test.after((t) => {
	endUI5App(t.context.proc);
});

test.serial("Ping endpoint is up and running", async (t) => {
	const {app} = t.context;

	const pingResponse = await app.get("/.ui5/coverage/ping");
	t.is(pingResponse.status, 200, "Ping was successful");
	t.is(pingResponse.type, "application/json", "Content-Type is correct");
	t.truthy(pingResponse.body.version, "Version is valid");
});

test.serial("Send coverage report", async (t) => {
	const {app} = t.context;

	// TODO: send valid content to the report endpoint and check result
	const reportResponse = await app.post("/.ui5/coverage/report");

	t.is(reportResponse.type, "application/json", "Content-Type is correct");
});
