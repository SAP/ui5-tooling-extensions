const test = require("ava");
const {createInstrumenterConfig} = require("../../lib/util");

// package.json should be exported to allow reading version (e.g. from @ui5/cli)
test("createInstrumenterConfig", async (t) => {
	const expectedConfig = {};
	const config = await createInstrumenterConfig();

	t.deepEqual(config, expectedConfig);
});
