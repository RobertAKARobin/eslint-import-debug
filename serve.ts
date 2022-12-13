// This is just a little test program. It serves files from the `public` folder
import * as path from 'https://deno.land/std@0.133.0/path/mod.ts';
import { serve } from 'https://deno.land/std@0.133.0/http/server.ts';

import { lookup } from 'https://deno.land/x/media_types@v3.0.2/mod.ts';

const rootFile = path.fromFileUrl(import.meta.url);
const rootDir = path.dirname(rootFile);

async function handleRequest(request: Request): Promise<Response> {
	let { pathname } = new URL(request.url);
	if (pathname.endsWith('/')) {
		pathname += 'index.html';
	}
	pathname = `${rootDir}/public${pathname}`;
	console.log(pathname);

	try {
		const file = await Deno.readFile(pathname);
		return new Response(file, {
			headers: {
				'content-type': lookup(pathname) || ``,
			}
		});
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) {
			return new Response(null, { status: 404 });
		}
		return new Response(null, { status: 500 })
	}
}

void (async function() {
	const PORT = 8000;
	console.log(`Serving on http://localhost:${PORT}`);
	await serve(handleRequest, { port: PORT });
})();
