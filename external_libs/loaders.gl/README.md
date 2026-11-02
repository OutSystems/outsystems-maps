# loaders.gl external bundle

This sub-project builds a standalone bundle of `@loaders.gl/core`, and `@loaders.gl/kml` that is checked in and consumed by the main library at runtime.

## Keeping versions aligned

The root `package.json` also lists `@loaders.gl/core` and `@loaders.gl/kml`, for TypeScript types only. Keep them on the same version as this bundle. The root version must also satisfy the `@loaders.gl/core` peer range of `@deck.gl/layers` (`^4.4.3` for deck.gl 9.4.x), otherwise `npm install` fails with `ERESOLVE`.

The `@xmldom/xmldom` override is a security fix. Keep it on the latest patch when you update this bundle.

## Version summary

| Context | Version | Purpose |
|---|---|---|
| Root `devDependencies` | 4.5.4 | TypeScript types / IDE tooling only |
| `external_libs/loaders.gl/` | 4.5.4 | Actual runtime bundle |

## Runtime side effects

None. The bundle produced here is self-contained (all loaders.gl internals are tree-shaken and inlined by Rollup). The consuming code never resolves `@loaders.gl/*` from `node_modules` at runtime — it imports from the pre-built bundle file directly.

