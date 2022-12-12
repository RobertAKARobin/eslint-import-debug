// This is brittle; just trying to get it to work before making it robust
const ts = require(`typescript`);
const denoResolver = require(`eslint-import-resolver-deno`);

const denoConfig = require(`./deno.json`); // TODO: Don't hardcode config location

const tsExtension = /\.ts$/;
module.exports = {
	resolveModuleNames: (
		moduleNames,
		containingFile,
		reusedNames,
		redirectedReference,
		options
	) => moduleNames.map((moduleName) => {
		const isDeno = moduleName.includes(`deno.land`) || containingFile.includes(`deno.land`); // TODO: Probably need something more robust than this
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
			return { // Can't use `ts.resolveModuleName` because it forces `.ts` or one of a few other file extensions, and the items in the Deno cache have no file extensions
				resolvedFileName: path,
				extension: `.ts`,
				// TODO: Add missing items from ResolvedModuleFull?
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
