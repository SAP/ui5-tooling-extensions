import ava from "eslint-plugin-ava";
import globals from "globals";
import js from "@eslint/js";
import google from "eslint-config-google";

export default [
	js.configs.recommended,
	google,
	ava.configs["flat/recommended"],
	{
		languageOptions: {
			globals: {
				...globals.node,
			},

			ecmaVersion: 2022,
			sourceType: "module",
		},

		settings: {
			jsdoc: {
				tagNamePreference: {
					return: "returns",
					augments: "extends",
				},
			},
		},

		rules: {
			"indent": ["error", "tab"],
			"linebreak-style": ["error", "unix"],

			"quotes": [
				"error",
				"double",
				{
					allowTemplateLiterals: true,
				},
			],

			"semi": ["error", "always"],
			"no-negated-condition": "off",
			"require-jsdoc": "off",
			"no-mixed-requires": "off",

			"max-len": [
				"error",
				{
					code: 120,
					ignoreUrls: true,
					ignoreRegExpLiterals: true,
				},
			],

			"no-implicit-coercion": [
				2,
				{
					allow: ["!!"],
				},
			],

			"comma-dangle": "off",
			"no-tabs": "off",
			// This rule must be disabled as of ESLint 9. It's removed and causes issues when present.
			// https://eslint.org/docs/latest/rules/valid-jsdoc
			"valid-jsdoc": 0,
		},
	},
	{
		files: ["**/*.cjs"],

		languageOptions: {
			ecmaVersion: 5,
			sourceType: "script",
		},
	},
	{
		files: ["test/integration/fixtures/ui5-app/webapp/**/*.js"],

		languageOptions: {
			globals: {
				...globals.browser,
				sap: "readonly",
				QUnit: "readonly",
			},
		},
	},
	{
		files: ["test/integration/*.js"],

		rules: {
			"ava/no-ignored-test-files": "off",
		},
	},
];
