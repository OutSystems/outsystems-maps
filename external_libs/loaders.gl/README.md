# loaders.gl external bundle

This sub-project builds a standalone bundle of `@loaders.gl/core`, and `@loaders.gl/kml` that is checked in and consumed by the main library at runtime.

## Why different versions?

The root `package.json` pins `@loaders.gl/core` and `@loaders.gl/kml` to **4.3.4** because `@deck.gl/layers@9.2.11` declares a peer dependency of `@loaders.gl/core@~4.3.4`. Installing any 4.4.x version in the root causes npm to throw an `ERESOLVE` conflict and block `npm install`.


## Version summary

| Context | Version | Purpose |
|---|---|---|
| Root `devDependencies` | 4.3.4 | TypeScript types / IDE tooling only |
| `external_libs/loaders.gl/` | 4.4.2 | Actual runtime bundle |

## Runtime side effects

None. The bundle produced here is self-contained (all loaders.gl internals are tree-shaken and inlined by Rollup). The consuming code never resolves `@loaders.gl/*` from `node_modules` at runtime — it imports from the pre-built bundle file directly.

