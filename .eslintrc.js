module.exports = {
	extends: [
		`eslint:recommended`,
		`plugin:@typescript-eslint/eslint-recommended`,
		`plugin:@typescript-eslint/recommended`
	],
	ignorePatterns: [
		`**/*.js`,
		`deno.types.d.ts`
	],
	overrides: [
		{
			extends: [
				`plugin:@typescript-eslint/recommended-requiring-type-checking`
			],
			files: [`*.ts`],
			parser: `@typescript-eslint/parser`,
			parserOptions: {
				moduleResolver: __dirname + `/deno-resolver.js`,
				project: [`./tsconfig.json`]
			},
		},
	],
};
