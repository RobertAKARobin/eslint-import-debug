# ESLint and Deno

## Goal

Work-in-progress, trying to make ESLint "work" on Deno projects.

"Work" means:

1. ESLint correctly lints everything (`npm run lint`)
2. Deno correctly builds everything (`deno task serve`)

## Discussions

- https://discord.com/channels/684898665143206084/775366479143108608/1037410165126873129
- https://github.com/denoland/deno_lint/issues/25#issuecomment-1307626597
- https://github.com/typescript-eslint/typescript-eslint/issues/5921#issuecomment-1301114215

## Blockers

- ~~Eslint can't resolve .ts extensions~~
    - Used custom resolver
- ~~Eslint can't resolve Deno's remote dependencies~~
    - Used `eslint-import-resolver-deno`
    - TODO: Repo isn't really maintained, so reproduce the relevant business logic
- ~~Eslint doesn't "know" about Deno's global types~~
    - Copied and pasted `lib.deno.ns.d.ts`
    - TODO: Don't manually copy this
- `vscode-eslint` extension chokes on anything ending in `.ts`
    - [This is a TS language server problem](https://github.com/microsoft/vscode-eslint/issues/1566)
    - This [may be fixed in an upcoming TS release?](https://github.com/microsoft/TypeScript/pull/51669)
