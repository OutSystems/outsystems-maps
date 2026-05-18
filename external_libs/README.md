# external_libs

This folder contains standalone bundling setups for third-party libraries that are required at runtime in OutSystems but cannot be consumed as npm packages directly.

## Why this exists

OutSystems applications load JavaScript as pre-compiled static files uploaded to the platform as resources. There is no npm resolution or module bundler at runtime, so any library that is not already available as a browser-compatible script must be bundled ahead of time and committed here.

Each subfolder is a self-contained project that:
- declares its own dependencies and pinned versions
- produces a single UMD file under its `dist/` directory
- exposes a named global on `window` for use by the OutSystems Maps TypeScript source

The root `package.json` only references these libraries as `devDependencies` (via `import type`) to support TypeScript type checking during development. The actual runtime code uses the bundled output.

## Contents

| Folder | Global exposed | Formats supported | Bundle |
|---|---|---|---|
| `loaders.gl/` | `window.loaders` | KML, GPX, TCX | `loaders.gl/dist/loaders.gl.js` |

## Adding a new library

1. Create a subfolder: `external_libs/<library-name>/`
2. Add a `package.json` with pinned dependencies and a `build` script using rollup
3. Add a `src/index.js` exporting only what the OutSystems Maps source needs
4. Add a `rollup.config.mjs` targeting UMD format with `browser: true`
5. Add a `.gitignore` ignoring `node_modules` (the `dist/` output is committed)
6. Run `npm install && npm run build` inside the subfolder
7. Add the library as a type-only `devDependency` in the root `package.json`
8. Declare the `window.<global>` type in `src/Global.d.ts`

## Rebuilding a bundle

```bash
cd external_libs/<library-name>
npm install
npm run build
```

The output file in `dist/` should be committed alongside the source.
