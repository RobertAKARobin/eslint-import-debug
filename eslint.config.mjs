import tsEslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
	{
		files: [`**/*.js`],
		languageOptions: {
			parser: tsEslint.parser,
			parserOptions: {
				ecmaFeatures: {
					latest: true,
				},
				projectService: true,
			},
		},
		plugins: {
			'@typescript-eslint': tsEslint.plugin,
			jsdoc,
		},
		rules: {
			'@typescript-eslint/no-unsafe-assignment': `error`,
			'jsdoc/valid-types': `error`,
			'no-undef': `error`,
		},
	},
];
