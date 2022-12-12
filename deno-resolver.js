const ts = require(`typescript`);
const denoResolver = require(`eslint-import-resolver-deno`);

const denoConfig = require(`./deno.json`);

const tsExtension = /\.ts$/;
module.exports = {
	resolveModuleNames: (
		moduleNames,
		containingFile,
		reusedNames,
		redirectedReference,
		options
	) => moduleNames.map((moduleName) => {
		const isDeno = moduleName.includes(`deno.land`) || containingFile.includes(`deno.land`);
		if (isDeno) {
			const { found, path } = denoResolver.resolve(
				moduleName,
				containingFile,
				{
					importMap: __dirname + (denoConfig.importMap || `import-map.json`),
				}
			);
			if (!found) {
				return undefined;
			}
			return {
				resolvedFileName: path,
				extension: `.ts`,
			}
		}
		return ts.resolveModuleName(
			moduleName.replace(tsExtension, ``),
			containingFile,
			options,
			ts.sys
		).resolvedModule;
	}),
};
