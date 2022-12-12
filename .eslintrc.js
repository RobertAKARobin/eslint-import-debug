module.exports = {
	extends: [
		`eslint:recommended`,
		`plugin:@typescript-eslint/eslint-recommended`,
		`plugin:@typescript-eslint/recommended`
	],
	env: {
		es6: true,
		node: true,
	},
	ignorePatterns: [
		`**/*.js`
	],
	overrides: [
		{
			extends: [
				`plugin:@typescript-eslint/recommended-requiring-type-checking`
			],
			files: [`*.ts`],
			parser: `@typescript-eslint/parser`,
			parserOptions: {
				moduleResolver: __dirname + `/eslint/deno-resolver.js`,
				project: [`./tsconfig.json`]
			},
		},
	],
};
