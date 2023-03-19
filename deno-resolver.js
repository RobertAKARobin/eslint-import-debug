// This is brittle; just trying to get it to work before making it robust
const fs = require(`fs`);
const pathUtil = require(`path`);
const ts = require(`typescript`);

const denoConfigPath = `deno.json`; // TODO configurable

const rx_isRemote = /https?:\/\//;

const tsConfigTemplatePath = `tsconfig.template.json`; // TODO configurable
const tsConfigPath = `tsconfig.json`; // TODO configurable
const tsFileExtension = /\.ts$/;

const denoConfig = JSON.parse(fs.readFileSync(denoConfigPath)); // TODO load .jsonc
const denoImportmap = JSON.parse(fs.readFileSync(denoConfig.importMap)).imports;
const denoVendorDirPath = denoConfig.importMap.match(/\/(.*?)\//)[1]; // TODO probably brittle

const tsConfig = JSON.parse(fs.readFileSync(tsConfigTemplatePath));
tsConfig.compilerOptions = {
	...(tsConfig.compilerOptions || {}),
	paths: {
		...(tsConfig.compilerOptions.paths || {}),
	}
}

module.exports = {
	resolveModuleNames: (
		modulesNames,
		moduleContainerName,
		_reusedNames,
		_redirectedReference,
		options,
	) => {
		const modulesResolved = modulesNames.map((moduleName) => {
			let moduleName_out = moduleName;

			if (rx_isRemote.test(moduleName)) {
				const moduleUrl = new URL(moduleName);
				const moduleDir_vendor = denoImportmap[`${moduleUrl.origin}/`];
				moduleName_out = pathUtil.join(
					denoVendorDirPath,
					moduleDir_vendor,
					moduleUrl.pathname,
				);
				tsConfig.compilerOptions.paths[moduleName] = [moduleName_out];
			}

			return ts.resolveModuleName(
				moduleName_out.replace(tsFileExtension, ``),
				moduleContainerName,
				options,
				ts.sys
			).resolvedModule;
		});

		fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, `\t`));
		return modulesResolved;
	},
};
