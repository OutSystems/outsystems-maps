<!-- This is an ADR template, follow the same convention for future ADRs -->

# ADR-0005: Self-Contained Bundling of NPM-Only Runtime Libraries via external_libs Folder

## Status

Proposed

## Context

OutSystems Maps is loaded by OutSystems applications as a pre-compiled AMD module
(`dist/OutSystemsMaps.js`). At runtime there is no npm resolution, no ES module
loader, and no bundler available on the OutSystems platform. Any JavaScript that
must run in the browser has to either be part of the compiled output or be
loaded as a standalone script and exposed on `window`.

This has worked well for the library's own TypeScript source — compiled by `tsc`
to a single AMD file via the `outFile` setting in `tsconfig.json` — and for
third-party libraries that ship browser-ready UMD/IIFE bundles (Google Maps,
Leaflet, `@googlemaps/markerclusterer`, TerraDraw, deck.gl). Those bundles are
loaded as standalone scripts by the OutSystems Forge component and attach
themselves to known `window` globals.

The pattern breaks when a third-party library we want to use is published **only**
as ES Modules or CommonJS, with no browser-ready distribution:

- It cannot be `import`-ed at runtime — there is no module loader on the host.
- It cannot be inlined into our `tsc`-compiled output — `tsc` only compiles
  TypeScript source files reachable via `///` triple-slash references; it does
  not bundle npm dependencies.
- Adding a full JavaScript bundler (webpack, rollup, esbuild) to the main
  pipeline would conflate compilation of our provider-isolated TypeScript with
  the unrelated concern of vendoring third-party runtime code, and would force a
  migration away from the AMD `outFile` model that the Forge integration relies
  on.

The concrete trigger was the new deck.gl-based `FileLayer` (ROU-12785), which
needed `@loaders.gl/kml` to parse KML files into GeoJSON before handing them to
deck.gl's `GeoJsonLayer`. `@loaders.gl/kml` is published as ESM/CJS only; there
is no official UMD distribution. The same situation is expected to recur for
future third-party libraries.

Additional constraints:

- The vendored bundle must be **version-pinned and reproducible** so that any
  future contributor can rebuild it deterministically from committed sources.
- The main build (`npm run build`) must remain unchanged in inputs, outputs, and
  execution time — vendoring third-party libraries should not slow down daily
  TypeScript development.
- TypeScript intellisense and type-checking must still resolve types for the
  vendored libraries during authoring.
- The output is shipped via the OutSystems Forge component, not via an npm
  install of OutSystems Maps — there is no programmatic install/upgrade path on
  the consumer side; the bundle must be available as a static file.

## Decision Drivers

- Enable runtime use of npm-only third-party libraries without introducing a
  runtime bundler.
- Keep the main TypeScript pipeline narrow, fast, and AMD-compatible.
- Keep produced bundles version-pinned, reproducible, and auditable.
- Preserve developer ergonomics: TypeScript intellisense and type-checking
  against the libraries' real types.
- Avoid runtime dependencies on third-party CDNs (availability, latency, supply
  chain, CSP).

## Considered Options

- **Option 1: Load libraries from a public CDN (unpkg, jsDelivr, etc.) at runtime**
  - Pros: No code committed here; transparent updates if the consumer wants
    them.
  - Cons: Adds an uncontrolled external runtime dependency for every OutSystems
    app using Maps; subject to availability and latency outside our control;
    supply-chain risk; complicates CSP configuration in enterprise OutSystems
    environments; the Forge component cannot easily pin a specific version of
    the library it depends on.

- **Option 2: Add a bundler (rollup/webpack/esbuild) to the main `npm run build`**
  - Pros: Single pipeline; no separate process for vendor code.
  - Cons: Conflates compilation of our authored TypeScript (already handled
    cleanly by `tsc` with `outFile`) with vendoring of third-party libraries;
    introduces a transitive dependency tree into the root `package.json`;
    increases build time on every change; abandoning `outFile` would require
    significant rework of the Forge integration.

- **Option 3: Vendor pre-built UMD files manually (download once from a CDN, commit)**
  - Pros: Minimal tooling.
  - Cons: Not reproducible — the committed file cannot be rebuilt from source;
    future contributors have no way to audit or upgrade it; equivalent to
    committing an unverifiable binary blob.

- **Option 4: Self-contained bundling subfolders under `external_libs/`**
  - Each library that needs runtime presence but is only published as ESM/CJS
    gets its own subfolder with a pinned `package.json`, a `rollup.config.mjs`
    producing a UMD bundle, a minimal `src/index.js` re-exporting only the
    symbols we need, and a committed `dist/<library>.js`. The root
    `package.json` lists the same libraries as type-only `devDependencies`
    (consumed via `import type`) so TypeScript can resolve their types during
    authoring without pulling them into the compiled output. Rebuilds are
    explicit: `cd external_libs/<library> && npm install && npm run build`.
  - Pros: Reproducible (rollup config + lockfile committed); auditable (anyone
    can regenerate the bundle from pinned sources); isolated from the main
    pipeline (zero impact on `npm run build`); transparent (each library
    documents the `window` global it attaches to); upgrade path is clear (bump
    pinned versions, rebuild, commit).
  - Cons: Upgrading a vendored library is a two-step process (rebuild then
    commit); the bundle output is committed to the repository, which is unusual
    but consistent with how the platform consumes this library; each subfolder
    is an additional dependency-management surface (its own `node_modules` and
    lockfile).

## Decision Outcome

Chosen option: **Option 4 — `external_libs/` subfolders**, because it is the
only option that:

1. Enables runtime use of npm-only libraries without introducing a runtime
   bundler.
2. Keeps the main build pipeline narrow, fast, and AMD-compatible.
3. Preserves reproducibility — the bundle can be regenerated from version-pinned
   sources at any time, by anyone, in isolation from the rest of the build.
4. Avoids runtime dependencies on third-party CDNs and the associated
   availability, latency, CSP, and supply-chain concerns.

Positive consequences:

- The library can adopt new npm-only third-party dependencies through a
  documented, repeatable pattern, without re-architecting the main pipeline.
- Each vendored library is self-contained: its dependencies, build
  configuration, and output live in one folder, with no entanglement with other
  parts of the codebase.
- The `import type` pattern in the root `package.json` keeps TypeScript
  intellisense and type-checking fully functional during authoring, even though
  the runtime code comes exclusively from the committed bundle.
- The convention (one folder per library, UMD output, named `window` global)
  generalises naturally for future libraries with the same shape — additional
  loaders.gl modules, geometry utilities, custom layer libraries, etc.

Negative consequences:

- Upgrading a vendored library is a two-step process: bump the version pins in
  the subfolder's `package.json`, rebuild, then commit the regenerated bundle
  alongside the source change.
- Vendored libraries form a separate dependency-management surface with their
  own `node_modules` and lockfile; security audits and dependency scans must be
  configured to cover them in addition to the root `package.json`.
- The committed `dist/<library>.js` is a generated artefact tracked in version
  control. Reviewers must remember that any change to a bundle file should
  always be accompanied by the corresponding source change in the same
  subfolder, and that the bundle should never be edited by hand.

## Implementation Details

### Folder layout

```
external_libs/
├── README.md
└── <library-name>/
    ├── package.json          # pinned deps, "build" script
    ├── rollup.config.mjs     # UMD output, named global, browser: true
    ├── src/index.js          # re-exports only what's needed
    ├── .gitignore            # ignores node_modules; dist/ is committed
    └── dist/<library>.js     # committed UMD bundle
```

Current contents:

| Folder | Global exposed | Bundle path |
|---|---|---|
| `loaders.gl/` | `window.loaders` | `loaders.gl/dist/loaders.gl.js` |

### Rebuild process

```bash
cd external_libs/<library-name>
npm install
npm run build
```

The regenerated `dist/<library>.js` must be committed alongside the source
change that prompted the rebuild.

### Adding a new vendored library

1. Create `external_libs/<library-name>/`.
2. Add `package.json` with pinned dependencies and a
   `rollup -c rollup.config.mjs` build script.
3. Add `src/index.js` exporting only the symbols the OutSystems Maps source
   needs.
4. Add `rollup.config.mjs` targeting `format: 'umd'` with `browser: true`
   resolution and `name: '<global>'` matching the desired `window` attachment.
5. Add `.gitignore` for `node_modules` (commit `dist/`).
6. Run `npm install && npm run build` in the subfolder.
7. Add the library as a type-only `devDependency` in the root `package.json`
   so TypeScript can resolve types via `import type`.
8. Declare `window.<global>` in `src/Global.d.ts`.
9. Coordinate with the Forge component to load the new bundle at runtime.

### Why TypeScript types still work

The root `package.json` lists the same libraries (`@loaders.gl/core`,
`@loaders.gl/kml`, etc.) as `devDependencies`. `src/Global.d.ts` uses
`import type` declarations to alias the library types into the global
namespace. Because `import type` is erased at compile time, these imports have
no impact on the AMD output produced by `tsc`. The runtime value of the global
(e.g. `window.loaders`) comes exclusively from the bundle in
`external_libs/<library>/dist/<library>.js`, loaded as a standalone script by
the Forge component.

### Boundary with already-UMD libraries

Libraries that already ship a browser-ready UMD/IIFE distribution (Google Maps
JS API, Leaflet, `@googlemaps/markerclusterer`, TerraDraw, deck.gl) do not
require an `external_libs/` subfolder. They continue to be referenced as
`devDependencies` for types only and loaded directly by the Forge component
from their own published bundles. `external_libs/` is reserved exclusively for
libraries that are **only** distributed as ESM/CJS.

## Links

- ROU-12785 (deck.gl FileLayer — first consumer of the pattern)
- Vendoring workflow reference: documented in this ADR
- [loaders.gl KMLLoader documentation](https://loaders.gl/docs/modules/kml/api-reference/kml-loader)

## Date

2026-05-19
