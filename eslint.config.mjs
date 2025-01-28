import jsdoc from 'eslint-plugin-jsdoc';

export default [
	{
		files: [`**/*.js`],
		plugins: {
			jsdoc,
		},
		rules: {
			'jsdoc/check-template-names': `error`,
		},
	},
];
