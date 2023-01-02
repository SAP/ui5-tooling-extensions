module.exports = {
	"parserOptions": {
		"sourceType": "module",
	},
	"env": {
		"node": true,
		"es2022": true
	},
	"extends": ["eslint:recommended", "plugin:ava/recommended", "google"],
	"plugins": [
		"ava"
	],
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double",
			{"allowTemplateLiterals": true}
		],
		"semi": [
			"error",
			"always"
		],
		"no-negated-condition": "off",
		"require-jsdoc": "off",
		"no-mixed-requires": "off",
		"max-len": [
			"error",
			{
				"code": 120,
				"ignoreUrls": true,
				"ignoreRegExpLiterals": true
			}
		],
		"no-implicit-coercion": [
			2,
			{"allow": ["!!"]}
		],
		"comma-dangle": "off",
		"no-tabs": "off",
		"valid-jsdoc": 0
	},
	"settings": {
		"jsdoc": {
			"tagNamePreference": {
				"return": "returns",
				"augments": "extends"
			}
		}
	},
	"root": true
};
