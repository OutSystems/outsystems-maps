<!-- This is an ADR template, follow the same convention for future ADRs -->

# ADR-0006: Replace Google KmlLayer with deck.gl-based FileLayer

## Status

Accepted

## Context

Google deprecated `google.maps.KmlLayer` on **April 30, 2026**. Per the
official deprecation notice and KML Layer Migration Guide, the class
remains available for existing applications but is closed to new projects
and will be subject to removal at a future date. Google offers two
migration paths:

1. **Data-driven styling for datasets** — upload KML data to Google's
   Maps Platform Datasets service and render it through the data-driven
   styling APIs.
2. **Third-party libraries** — parse KML on the client and render the
   resulting geometry through the Data layer or any overlay (e.g.
   deck.gl).

OutSystems Maps' File Layer block has historically used `KmlLayer` as
its rendering backend. Without a replacement, the feature becomes a
deprecation liability and would eventually stop working entirely.

Aside from the deprecation itself, `KmlLayer` carries structural
limitations that have constrained OutSystems applications:

- The KML file is fetched and parsed on Google's servers, not in the
  browser. Files behind authentication or on internal networks cannot
  be loaded, and the documented file-size cap (~3 MB) is enforced by
  Google's parser, not by the consumer.
- Styling is limited to what KML's `<Style>` definitions allow; the
  consumer has no programmatic control over feature rendering once the
  layer is constructed.
- `KmlLayer` exists only in the Google Maps JS API, so the File Layer
  block is Google-only — there is no parallel path for Leaflet.

A parallel deck.gl migration for HeatmapLayer is already documented in
ADR-0003. JIRA ROU-12785 (a Spike under epic ROU-3078) calls out the
same approach for File Layer: *"Given that we're already using deck.gl
we should try to understand if it could be feasible to replace Google
version with it."* Co-locating both visualisation features under
`src/Providers/Layers/deck.gl/` reduces the amount of Google-specific
code and creates a consistent extension path for future Leaflet
support.

Additional constraints carried over from ADR-0003:

- The replacement must work on top of Google Maps — the existing map
  provider stays unchanged.
- The framework layer (`src/OSFramework/Maps/FileLayer/`) must remain
  provider-agnostic; the new implementation lives outside
  `src/Providers/Maps/Google/`.
- The legacy Google-native File Layer must be retained temporarily for
  backward compatibility so developers can migrate at their own pace
  before Google fully removes `KmlLayer`.
- KML is published as `@loaders.gl/kml` on npm, ESM/CJS only — see
  ADR-0005 for how that constraint is addressed.

## Decision Drivers

- Eliminate the dependency on the deprecated `google.maps.KmlLayer`
  before Google removes it from active versions.
- Allow client-side parsing so private/internal KML files load
  successfully, removing the server-side `KmlLayer` parser's file-size
  cap and public-URL requirement as a side benefit.
- Keep changes transparent to OutSystems developers: the existing File
  Layer block, its OnClick payload, and the
  `MapAPI.FileLayerManager.CreateFileLayer` signature must continue to
  work.
- Align with ADR-0003: place client-side visualisation layers under the
  same provider-agnostic deck.gl namespace.
- Retain the legacy Google-native File Layer behind a flag so adopters
  can fall back if a regression appears, until Google fully retires
  `KmlLayer`.

## Considered Options

- **Option 1: Continue using `google.maps.KmlLayer`**
  - Pros: No new dependency; no migration effort.
  - Cons: The feature will stop working entirely once Google removes
    `KmlLayer` from active versions following its April 30, 2026
    deprecation. Inherits the existing limitations (server-side parse,
    file-size cap, public-URL requirement). Permanently coupled to
    Google Maps; no path toward provider-agnostic File Layer support.
    Diverges from the direction set by ADR-0003 for the HeatmapLayer.

- **Option 2: Migrate to Google's Data-driven Styling for Datasets**
  - The first migration path Google itself recommends. KML data is
    uploaded to the Maps Platform Datasets service and rendered through
    the data-driven styling APIs.
  - Pros: Officially supported by Google; survives the deprecation
    timeline.
  - Cons: Requires uploading every KML dataset to Google's
    infrastructure ahead of time and managing dataset IDs at runtime —
    a workflow change that is invasive for OutSystems developers and
    incompatible with on-the-fly KML URLs that users currently pass to
    the block. Adds a Google Maps Platform billing surface
    (Datasets API). Still tightly coupled to Google Maps; no path
    toward Leaflet support. Diverges from ADR-0003's
    provider-abstraction direction.

- **Option 3: deck.gl `GeoJsonLayer` + `@loaders.gl/kml` parser via `GoogleMapsOverlay`**
  - The second migration path Google itself recommends (*"Use
    third-party libraries to parse KML and display it using the Data
    layer or other overlays."*). `@loaders.gl/kml` is the official KML
    loader from the vis.gl ecosystem that also produces deck.gl. It
    returns a GeoJSON `FeatureCollection` that feeds directly into
    `deck.GeoJsonLayer`, which is then attached to the Google Map
    through `deck.GoogleMapsOverlay` (the same mechanism used by the
    HeatmapLayer per ADR-0003).
  - Pros: Mature, GPU-accelerated rendering; preserves the existing
    block API for OutSystems developers (consumer still passes a URL —
    no dataset ingestion step); client-side parsing removes the
    file-size cap and the public-URL requirement; consistent with the
    HeatmapLayer architecture; opens a future migration path to Leaflet
    through the same deck.gl overlays. Actively maintained by the
    OpenJS Foundation (vis.gl).
  - Cons: Adds a new third-party dependency (`@loaders.gl/kml`). The
    loader is published only as ESM/CJS, so we must vendor it (see
    ADR-0005). Property changes follow deck.gl's rebuild-and-setProps
    pattern rather than incremental setters.

## Decision Outcome

Chosen option: **Option 3 — deck.gl `GeoJsonLayer` + `@loaders.gl/kml`**,
because it is the only option that:

1. Eliminates the dependency on the deprecated `KmlLayer` within the
   required timeline without requiring OutSystems developers to change
   how they author the File Layer block (the consumer still supplies a
   plain URL, exactly as before).
2. Co-locates the File Layer implementation with the HeatmapLayer under
   a provider-agnostic deck.gl namespace, consistent with ADR-0003.
3. Re-uses the same `GoogleMapsOverlay` integration mechanism that
   ADR-0003 already validated for HeatmapLayer.
4. Establishes a viable path toward Leaflet support for File Layer in
   the future via deck.gl's Leaflet overlay — something neither
   `KmlLayer` nor Google's Datasets approach can offer.
5. Removes `KmlLayer`'s file-size cap and public-URL requirement as a
   side benefit by parsing KML in the browser.

Positive consequences:

- File Layer can load larger files and files behind authentication that
  `KmlLayer` could never render.
- The OutSystems developer-facing API is unchanged. Existing applications
  that use the File Layer block continue to work with no code changes.
- The deck.gl File Layer lives in the same `src/Providers/Layers/deck.gl/`
  namespace as the HeatmapLayer — future visualisation layers follow the
  same shape.

Negative consequences:

- A new third-party stack (`@loaders.gl/kml` and the existing
  `@deck.gl/*` packages) is now responsible for KML rendering. Upgrades to
  this stack require coordinated maintenance, including a manual rebuild
  of the vendored loaders.gl bundle (see ADR-0005).
- Property changes (`layerUrl`, `suppressPopups`, `preserveViewport`) are
  handled by recreating the deck.gl layer and calling
  `overlay.setProps({ layers })`, rather than incremental setters. deck.gl's
  internal diffing keeps the visual cost negligible.

## Implementation Details

### Coexistence strategy

An `internalUseDeckglLoader` boolean was added to
`OutSystems.Maps.MapAPI.FileLayerManager`, defaulting to `true`. The
framework factory (`src/OSFramework/Maps/FileLayer/Factory.ts`) routes to
either `Provider.Layers.deckgl.FileLayer.FileLayerFactory` (when the flag
is true) or the legacy `Provider.Maps.Google.FileLayer.FileLayerFactory`
(when it is false), based on the flag passed in by
`FileLayerManager.CreateFileLayer`. The legacy Google-native File Layer
is retained behind the flag for the same backward-compatibility window
ADR-0003 established for HeatmapLayer; it will be removed in a future
release once the deck.gl path is proven stable and Google fully retires
`KmlLayer`.

`MapAPI.FileLayerManager.SetUseDeckglLoader(false)` is the public escape
hatch for falling back to the Google-native path.

### Versioning

Per the JIRA acceptance criteria, this change ships in OutSystems Maps
**v2.4.0** (minor bump from v2.3.2). The deck.gl path is the default
for new installations; existing applications inherit it on upgrade
without any code change.

### Namespace and file structure

A new sub-namespace was introduced under `src/Providers/Layers/deck.gl/`:

| File | Role |
|---|---|
| `FileLayer/FileLayer.ts` | Orchestrator. Loads the KML via the vendored loaders.gl bundle, builds the icon atlas, constructs a `deck.GeoJsonLayer`, wraps it in `deck.GoogleMapsOverlay`, and attaches it to the Google Map. Owns the property-change path (rebuild layer + setProps). |
| `FileLayer/Factory.ts` | Factory method `MakeFileLayer()` that instantiates the deck.gl File Layer for the framework's Factory. |
| `FileLayer/IIconMapping.ts` | TypeScript interface for atlas entries passed to `GeoJsonLayer`'s `iconMapping`: `{ x, y, width, height, anchorX, anchorY }`. |
| `Constants.ts` | Namespace-level constants shared across deck.gl layer implementations: `DEFAULT_ICON_KEY` (`'__default__'`), `DEFAULT_ICON_URL` (path to the bundled fallback marker image), `ICON_CELL_SIZE` (`64` px), `DEFAULT_STROKE_COLOR` (`[66, 133, 244, 255]` — Google-blue, fully opaque), and `DEFAULT_FILL_COLOR` (`[66, 133, 244, 60]` — Google-blue, ~24% opaque). |
| `Helper.ts` | Shared utility functions for deck.gl layer implementations. `HexToRgba(hex)` converts a `#RRGGBB` or `#RRGGBBAA` hex string to a `[r, g, b, a]` color tuple compatible with deck.gl color accessors. |
| `Configuration/FileLayer/FileLayerConfigs.ts` | Configuration class implementing `IConfigurationFileLayer` (`layerUrl`, `preserveViewport`, `suppressPopups`). |

### Pipeline

1. `_loadAndBuild()` calls `window.loaders.load(this.config.layerUrl, window.loaders.KMLLoader)` — the vendored loaders.gl bundle (see ADR-0005) parses the KML into a GeoJSON-shaped object (`{ shape: 'geojson-table', type: 'FeatureCollection', features: [...] }`).
2. The orchestrator pre-builds an icon atlas from the features (see next section).
3. `_buildProviderLayer()` constructs `deck.GeoJsonLayer` with `pointType: 'icon'`, the pre-built `iconAtlas` and `iconMapping`, plus pixel-unit fallback stroke/fill styles for any LineString/Polygon geometries the KML may contain.
4. The layer is wrapped in a `deck.GoogleMapsOverlay` and attached to the map via `overlay.setMap(this.map.provider)`. If `preserveViewport` is `false`, the orchestrator walks the loaded features to compute bounds and calls `map.fitBounds(...)`.

### Icon rendering — pre-built atlas (not deck.gl's URL auto-atlas)

KML files reference icon images by URL inside each placemark's `<Style>`
definition (e.g. Google's `mapfiles/kml/pushpin/ylw-pushpin.png`).
`@loaders.gl/kml` surfaces these URLs as `feature.properties.icon`.

deck.gl's `GeoJsonLayer` supports an automatic mode in which `getIcon`
returns `{ url, width, height, anchor* }` per feature and deck.gl
internally calls `@loaders.gl/core`'s `load(url)` to fetch and texture
each icon. **This automatic mode does not work in this codebase.** The
deck.gl runtime bundle carries its own copy of `@loaders.gl/core`,
distinct from the vendored copy in `external_libs/loaders.gl` (ADR-0005).
deck.gl's bundled core has no `ImageLoader` registered, so it throws:

> `deck: No valid loader found (ylw-pushpin.png, MIME type: "image/png", first bytes: not available)`

Registering `ImageLoader` against our vendored core does not help — the
two loaders.gl/core instances have separate, module-scoped registries
(the same multi-instance constraint noted in ADR-0005's rationale for
keeping vendored libraries independent of the main pipeline).

To bypass deck.gl's loader path entirely, the File Layer **pre-builds
an icon atlas in the browser** before constructing the deck.gl layer:

1. Walk the loaded features and collect unique `properties.icon` URLs
   (trimmed). A default fallback URL (`Constants.DEFAULT_ICON_URL`) is
   always included so features without an explicit icon still render.
2. Load each URL via `_tryLoad(url, withCors = true)` — a thin
   `Promise<HTMLImageElement | null>` wrapper around `new Image()`.
   The bundled default icon is fetched without `crossOrigin` (local
   asset); all external KML icon URLs use `crossOrigin = 'anonymous'`.
   A `null` result means the fetch failed; the icon is omitted from
   the atlas without blocking the layer.
3. The default image (`_defaultImg`) is cached with `??=` and persists
   across URL changes, so the bundled marker is only fetched once per
   layer instance.
4. Composite successful loads into an offscreen `<canvas>`. Icons are
   packed into a square grid: `cols = Math.max(1, Math.ceil(Math.sqrt(entries.length)))`,
   `rows = Math.ceil(entries.length / cols)`. Each cell is
   `ICON_CELL_SIZE × ICON_CELL_SIZE` pixels (64 px, from `Constants.ICON_CELL_SIZE`).
5. Construct an `iconMapping` keyed by URL, where each value is an
   `IIconMapping` record (`x`, `y`, `width`, `height`, `anchorX`,
   `anchorY`). Anchor is set to bottom-centre (`anchorX = size/2`,
   `anchorY = size`), matching pushpin convention.
6. Pass the canvas to `iconAtlas` and the mapping to `iconMapping` on
   `GeoJsonLayer`. `getIcon` returns the URL string as the mapping key
   (falling back to `Constants.DEFAULT_ICON_KEY` — `'__default__'` —
   when no atlas entry exists for the feature's URL).

This approach is robust to whatever deck.gl bundle the OutSystems Forge
component happens to load, because the layer never asks deck.gl to fetch
icons — it hands deck.gl a finished texture.

### Color resolution — `_colorFromProperties`

After loaders.gl parses the KML, Polygon and LineString features carry style
properties inherited from the KML `<Style>` block:

| GeoJSON property | Type | Meaning |
|---|---|---|
| `fill` | `#RRGGBB` hex string | Polygon fill colour |
| `fill-opacity` | `number` 0–1 | Polygon fill opacity |
| `stroke` | `#RRGGBB` hex string | Line/polygon border colour |
| `stroke-opacity` | `number` 0–1 | Line/polygon border opacity |
| `stroke-width` | `number` (px) | Line width in pixels |

`_colorFromProperties(props, colorKey, opacityKey, fallback)` centralises
hex-to-RGBA conversion for both `getLineColor` and `getFillColor` callbacks
on `GeoJsonLayer`. It:

1. Reads `props[colorKey]` as a `#RRGGBB` string.
2. Delegates the hex-to-RGBA conversion to `Helper.HexToRgba(hex)`, which
   parses `r`, `g`, `b` (and optionally `a`) from a `#RRGGBB` or `#RRGGBBAA`
   string using `parseInt(hex.slice(...), 16)`. When no alpha channel is
   present in the hex string, the alpha defaults to `255` (fully opaque).
3. Reads `props[opacityKey]` (defaults to `1` if absent) and scales it to
   the 0–255 alpha range with `Math.round(opacity * 255)`, overriding the
   alpha returned by `HexToRgba`.
4. Returns `[r, g, b, a]`. If the hex string is absent or malformed,
   returns the caller-supplied `fallback` tuple directly.

Default fallback values are defined as `Constants.DEFAULT_STROKE_COLOR` and
`Constants.DEFAULT_FILL_COLOR` and referenced by name in `_buildProviderLayer()`:
- `getLineColor` fallback: `Constants.DEFAULT_STROKE_COLOR` → `[66, 133, 244, 255]` — Google-blue, fully opaque.
- `getFillColor` fallback: `Constants.DEFAULT_FILL_COLOR` → `[66, 133, 244, 60]` — Google-blue, ~24% opaque.

### Event flow

Click events are routed through deck.gl's `onClick` callback on
`GeoJsonLayer`. The handler stringifies `info.coordinate` (as
`{Lat, Lng}`) and `info.object.properties` (as `featureData`) and fires
the framework's `FileLayersEventType.OnClick` event with the same payload
shape the legacy Google implementation produced. The
`suppressPopups` config drives `pickable` on the deck.gl layer; the
legacy `KmlMouseEvent.featureData` payload is replaced by the GeoJSON
`properties` of the picked feature, which carries the same data
(`name`, `description`, etc.) that consumers historically depended on.

### Lifecycle

- `build()` → `_loadAndBuild()` (async): fetch + parse KML, build atlas,
  construct deck.gl layer + overlay, attach to map, optionally fit bounds,
  then `finishBuild()`.
- `changeProperty(layerUrl)` → tear down the overlay, clear the atlas,
  re-run `_loadAndBuild(false)` with the new URL. `_defaultImg` is
  intentionally preserved (not cleared) to avoid re-fetching the
  bundled fallback icon.
- `changeProperty(suppressPopups)` → rebuild the layer and call
  `overlay.setProps({ layers })`; atlas state is preserved.
- `changeProperty(preserveViewport)` → invoke `_fitBounds()` when the new
  value is `false`.
- `refreshProviderEvents()` → rebuilds the deck.gl layer via
  `_createFileLayer()` (GeoJSON data and atlas are preserved); called by
  the framework when click-handler registration changes after `build()`
  completes, so `onClick` wiring on the layer stays in sync.
- `dispose()` → detach the overlay, finalise deck.gl resources, clear all
  retained state (`_provider`, `_geoJsonLayer`, `_geoJsonData`,
  `_iconAtlas`, `_iconMapping`).

### Dependency on ADR-0005

The vendored `external_libs/loaders.gl` bundle is the **first consumer**
of the pattern documented in ADR-0005 and is what makes this File Layer
implementation possible. `@loaders.gl/kml` v4.4.2 is published only as
ESM/CJS — without the `external_libs/loaders.gl` UMD bundle exposing
`window.loaders.load` and `window.loaders.KMLLoader`, this option would
not have been buildable. Any future change to the KML parser version,
or addition of further loaders.gl modules (e.g. GPX), follows the
rebuild process described in ADR-0005.

## Links

- ROU-12785 — Spike: *[OSMaps] - Investigate how to replace KmlLayer that Google deprecated by deck.gl*
- ROU-3078 — parent epic: *OutSystems Maps*
- [ADR-0003: Replace Google HeatmapLayer with deck.gl HeatmapLayer](./ADR-0003-Replace-Google-HeatmapLayer-with-deck-gl.md)
- [ADR-0005: Self-Contained Bundling of NPM-Only Runtime Libraries via external_libs Folder](./ADR-0005-Self-Contained-Bundling-of-NPM-Only-Runtime-Libraries.md)
- [Google Maps Platform deprecations](https://developers.google.com/maps/deprecations)
- [Google KML Layer Migration Guide](https://developers.google.com/maps/documentation/javascript/kml-layer-migration)
- [Google Maps Datasets overview](https://developers.google.com/maps/documentation/javascript/dds-datasets/overview)
- [deck.gl GeoJsonLayer API](https://deck.gl/docs/api-reference/layers/geojson-layer)
- [deck.gl GoogleMapsOverlay](https://deck.gl/docs/api-reference/google-maps/google-maps-overlay)
- [@loaders.gl/kml API reference](https://loaders.gl/docs/modules/kml/api-reference/kml-loader)

## Date

2026-05-19
