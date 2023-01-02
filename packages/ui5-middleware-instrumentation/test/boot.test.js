import test from "ava";

// package.json should be exported to allow reading version (e.g. from @ui5/cli)
test("first test", (t) => {
	t.truthy(1);
});
