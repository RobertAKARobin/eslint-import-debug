const fs = require(`fs`);
const sys = require(`child_process`);

const denoTypesPath_remote_fromVersion = denoVersion =>
`https://github.com/denoland/deno/releases/download/v${denoVersion}/lib.deno.d.ts`;
const denoTypesPath_local = `deno.types.d.ts`;

(async function() {
	const denoVersion = await new Promise((resolve) => sys // TODO config deno version
		.exec(`deno eval 'console.log(Deno.version.deno)'`)
		.stdout
		.on(`data`, data => resolve(data.trim()))
	);
	const denoTypesPath_remote = denoTypesPath_remote_fromVersion(denoVersion);
	const denoTypesResponse = await fetch(denoTypesPath_remote);
	const denoTypes = await denoTypesResponse.text();
	fs.writeFileSync(denoTypesPath_local, denoTypes);
})();
