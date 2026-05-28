# Plan: GeoRSS Support for deck.gl FileLayer

## Context

The deck.gl `FileLayer` currently hard-codes `window.loaders.KMLLoader` as the only file format it can parse. Adding GeoRSS support would allow rendering RSS/Atom feeds with embedded `<georss:point/line/polygon>` geometry.

No GeoRSS loader exists in any installed dependency:
- `@loaders.gl/kml` v4.4.2 exports only `KMLLoader`, `GPXLoader`, `TCXLoader`
- `@tmcw/togeojson` (the underlying XML→GeoJSON library) supports only `kml`, `gpx`, `tcx`

The `window.loaders` global is a self-contained rollup UMD bundle built from `external_libs/loaders.gl/` — adding a new loader means writing it there and rebuilding.

---

## Files to Change

| File | Change |
|------|--------|
| `external_libs/loaders.gl/src/georss-loader.js` | **New file** — GeoRSS→GeoJSON parser + loaders.gl loader object |
| `external_libs/loaders.gl/src/index.js` | Export `GeoRSSLoader` |
| `external_libs/loaders.gl/dist/loaders.gl.js` | Rebuilt artifact (via `npm run build` inside that folder) |
| `src/Global.d.ts` | Add `GeoRSSLoader` type to `window.loaders` |
| `src/Providers/Layers/deck.gl/FileLayer/FileLayer.ts` | Pass both loaders to `window.loaders.load()` |

---

## Step-by-Step Implementation

### 1. Create `external_libs/loaders.gl/src/georss-loader.js`

Implement a loaders.gl-compatible loader object — mirrors the pattern of `kml-loader.js`.

**Loader detection** (`tests` array): loaders.gl uses these strings to sniff content. GeoRSS files are RSS or Atom feeds:

```js
tests: ['<rss', '<feed']
```

**Parser** — Simple GeoRSS geometry (all use lat/lng order → swap to GeoJSON lng/lat):
- `<georss:point>lat lng</georss:point>` → `Point`
- `<georss:line>lat0 lng0 lat1 lng1 …</georss:line>` → `LineString`
- `<georss:polygon>lat0 lng0 lat1 lng1 …</georss:polygon>` → `Polygon`
- `<georss:box>minLat minLng maxLat maxLng</georss:box>` → `Polygon` (4-corner bbox)

**Feature items** — support both RSS (`<item>`) and Atom (`<entry>`):
- `title` ← `<title>`
- `description` ← `<description>` (RSS) or `<summary>` (Atom)
- `link` ← `<link>` (RSS) or `<link href="…">` (Atom)

Items without any georss geometry are skipped. Output shape matches KMLLoader (`geojson-table`), so the rest of the FileLayer pipeline is unchanged.

Use `DOMParser` from `@xmldom/xmldom` — already a transitive dep via `@loaders.gl/kml`, no new packages needed.

```js
export const GeoRSSLoader = {
    name: 'GeoRSS',
    id: 'georss',
    module: 'kml',
    version: '4.4.2',
    extensions: ['rss', 'atom', 'georss'],
    mimeTypes: ['application/rss+xml', 'application/atom+xml'],
    text: true,
    tests: ['<rss', '<feed'],
    parse: async (arrayBuffer) => parseGeoRSS(new TextDecoder().decode(arrayBuffer)),
    parseTextSync: (text) => parseGeoRSS(text),
};
```

### 2. Export from `external_libs/loaders.gl/src/index.js`

```js
export { load } from '@loaders.gl/core';
export { KMLLoader } from '@loaders.gl/kml';
export { GeoRSSLoader } from './georss-loader.js';
```

### 3. Rebuild the UMD bundle

```bash
cd external_libs/loaders.gl
npm run build
```

This regenerates `external_libs/loaders.gl/dist/loaders.gl.js`.

### 4. Update `src/Global.d.ts`

Add `GeoRSSLoader` to the `window.loaders` interface. Since `GeoRSSLoader` is a plain JS object following the same duck type as `KMLLoader`, reuse `typeof OriginalKMLLoader`:

```typescript
loaders: {
    load: typeof LoadersGlLoad;
    KMLLoader: typeof OriginalKMLLoader;
    GeoRSSLoader: typeof OriginalKMLLoader;  // same loader interface shape
};
```

### 5. Update `_loadAndBuild` in `src/Providers/Layers/deck.gl/FileLayer/FileLayer.ts`

Pass an array of loaders — loaders.gl auto-selects based on `tests` content sniffing:

```typescript
// Before:
this._geoJsonData = (await window.loaders.load(
    this.config.layerUrl,
    window.loaders.KMLLoader
)) as DeckglGeoJsonLayerData;

// After:
this._geoJsonData = (await window.loaders.load(
    this.config.layerUrl,
    [window.loaders.KMLLoader, window.loaders.GeoRSSLoader]
)) as DeckglGeoJsonLayerData;
```

KML files match `KMLLoader` (starts with `<kml`), GeoRSS files match `GeoRSSLoader` (starts with `<rss` or `<feed`).

---

## Effort Estimate

**Low-Medium.** The GeoRSS parser itself is ~120 lines of straightforward XML walking. No new npm packages, no framework changes, no public API changes. The rollup build step is already set up.

---

## Verification

1. Add a sample GeoRSS file to `docs/sample.kml/` (e.g. `sample.georss.xml`) with a few `<item>` entries containing `<georss:point>` and `<georss:polygon>`.
2. Run `npm run dev` and load a map with `layerUrl` pointing to the sample file.
3. Confirm features appear on the map with correct geometry and properties.
4. Confirm existing KML files (`googlecta.kml.xml`, `westcampus.kml.xml`) still render correctly.
5. Run `npm run build` to confirm no TypeScript lint errors.
