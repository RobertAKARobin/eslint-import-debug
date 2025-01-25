import json from '@eslint/json';

const sortKeys = {
	'sort-keys': [`error`, `asc`, {
		allowLineSeparatedGroups: true,
	}],
};

export default [
	{
		files: [`index.js`],
		rules: sortKeys,
	},

	{
		files: [`index.json`],
		language: `json/json`,
		plugins: {
			json,
		},
		rules: sortKeys,
	}
];
