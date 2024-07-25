export default {
	files: ["test/unit/**/*.js"],
	watchMode: {
		ignoreChanges: [
			"tmp/**"
		]
	},
	nodeArguments: [
		"--loader=esmock",
		"--no-warnings"
	],
	workerThreads: false
};
