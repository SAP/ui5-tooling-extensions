import test from "ava";
import path from "node:path";
import getPort from "get-port";
import waitOn from "wait-on";
import request from "supertest";
import {spawn} from "node:child_process";

const baseConfigPath = "test/integration/fixtures/config/";

let install;

async function setup() {
	if (!install) {
		const child = spawn(`npm i`, [], {
			stdio: "inherit", // > don't include stdout in test output,
			shell: true,
			cwd: "test/integration/fixtures/ui5-app/",
			detached: true, // this for being able to kill all subprocesses of above `ui5 serve` later
		});

		install = new Promise( (resolve) => {
			child.on("close", resolve);
		});
	}

	return install;
}

async function startUI5App(config = "./ui5.yaml") {
	await setup();
	const configPath = path.resolve(config);
	const port = await getPort();
	// start ui5-app
	const childProcess = spawn(`npm start`, [
		`-- --config ${configPath} --port ${port}`,
	], {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: "test/integration/fixtures/ui5-app/",
		detached: true, // this for being able to kill all subprocesses of above `ui5 serve` later
	});

	await waitOn({resources: [`http://localhost:${port}`]});
	const app = request(`http://localhost:${port}`);
	return {childProcess, app};
}

function shutDownUI5App(childProcess) {
	// kill all processes that are in the same pid group (see detached: true)
	process.kill(-childProcess.pid);
}

test.serial("Ping endpoint is up and running", async (t) => {
	const {childProcess, app} = await startUI5App(baseConfigPath + "ui5-simple.yaml");

	const pingResponse = await app.get("/.ui5/coverage/ping");
	t.is(pingResponse.status, 200, "Ping was successful");
	t.is(pingResponse.type, "application/json", "Content-Type is correct");
	t.truthy(pingResponse.body.version, "Version is valid");

	shutDownUI5App(childProcess);
});

test.serial("Send coverage report", async (t) => {
	const {childProcess, app} = await startUI5App(baseConfigPath + "ui5-simple.yaml");

	// TODO: send valid content to the report endpoint and check result
	const reportResponse = await app.post("/.ui5/coverage/report");

	t.is(reportResponse.type, "application/json", "Content-Type is correct");

	shutDownUI5App(childProcess);
});
