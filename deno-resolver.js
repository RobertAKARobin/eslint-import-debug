// This is brittle; just trying to get it to work before making it robust
const fs = require(`fs`);
const pathUtil = require(`path`);
const ts = require(`typescript`);

const denoVendorDirPath = `./vendor`; // TODO config
const denoImportmapPath = `${denoVendorDirPath}/import_map.json`; // TODO config

const rx_isRemote = /https?:\/\//;

const tsConfigTemplatePath = `tsconfig.template.json`;
const tsConfigPath = `tsconfig.json`;
const tsFileExtension = /\.ts$/;

const denoImportmap = JSON.parse(fs.readFileSync(denoImportmapPath)).imports; // TODO load from deno.json, which gets it from deno vendor

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
