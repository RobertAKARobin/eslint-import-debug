module.exports = {
	env: {
		es6: true,
		node: true,
	},
	overrides: [
		{
			extends: [
				"plugin:@typescript-eslint/recommended-requiring-type-checking"
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
