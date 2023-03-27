export default {
	files: ["test/unit/**/*.js"],
	ignoredByWatcher: [
		"tmp/**"
	],
	nodeArguments: [
		"--loader=esmock",
		"--no-warnings"
	]
};
