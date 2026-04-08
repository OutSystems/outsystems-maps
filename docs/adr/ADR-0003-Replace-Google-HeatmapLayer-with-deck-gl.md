<!-- This is an ADR template, follow the same convention for future ADRs -->

# ADR-0003: Replace Google HeatmapLayer with deck.gl HeatmapLayer

## Status

Accepted

## Context

Google is removing the `HeatmapLayer` from the Maps JavaScript API
Visualization library. The timeline is as follows:

- **May 2026** – First version without the deprecated Heatmap feature
  (v3.65) shipped to the weekly channel.
- **February 2027** – v3.64 (last version that includes the Heatmap
  feature) retired; `google.maps.visualization.HeatmapLayer` unavailable in every active version.

As a replacement, Google recommends third-party library integrations such as
deck.gl, which offers its own `HeatmapLayer` implementation.

OutSystems Maps relied on `google.maps.visualization.HeatmapLayer` to
provide its HeatmapLayer block (`HeatmapLayer.HeatmapLayer`). Without a
replacement, that feature would become entirely non-functional for Google
Maps users by May 2026 at the latest.

Beyond the deprecation, the Google-native heatmap has additional limitations
that affect OutSystems Maps:

- **Gradient configuration uses CSS color strings.** The Google heatmap
  accepts gradients as an array of CSS color strings (`string[]`), which
  does not align well with the structured color model (`{red, green, blue,
  alpha, hex}`) used by the OutSystems platform. This forces a lossy
  conversion at the configuration boundary.
- **No minimum intensity control.** Google's heatmap only exposes
  `maxIntensity`; there is no way to set a `minIntensity`, limiting the
  developer's ability to fine-tune the color ramp.
- **Tight coupling to Google's Visualization library.** The heatmap is part
  of the `visualization` library, which must be loaded separately and is
  only available for Google Maps. This makes it impossible to extend heatmap
  support to other providers in the future without a completely different
  implementation.

Additional constraints:

- The replacement must work on top of Google Maps — the existing map
  provider must remain unchanged.
- The old Google-native heatmap must be retained temporarily for backward
  compatibility, allowing developers to migrate at their own pace before
  v3.64 is retired.
- The framework layer (`OSFramework/`) must remain provider-agnostic; the
  new implementation must live outside `Providers/Maps/Google/`.
- deck.gl scripts are loaded at runtime (same pattern as other external
  libraries). The implementation must use `globalThis.deck.*` constructors.

## Decision Drivers

- Eliminate the dependency on the deprecated
  `google.maps.visualization.HeatmapLayer` before it is removed.
- Support the structured color model for better DevX (`Color` type with `red`, `green`,
  `blue`, `alpha`, `hex`) natively, without lossy conversion.
- Add `minIntensity` support via the `colorDomain` property.
- Decouple the heatmap rendering from Google's Visualization library so the
  architecture can be extended to other map providers in the future.
- MAke migration plan as painless to OutSystems developers as possible.
- Retain the old Google-native implementation behind a deprecated block so
  developers can migrate gradually ans consciently.

## Considered Options

- **Option 1: Continue using `google.maps.visualization.HeatmapLayer`**
  - Pros: No new dependency; no migration effort.
  - Cons: The feature will stop working entirely when Google removes the
    Visualization library. Cannot support structured color gradients without
    lossy conversion. Permanently coupled to
    Google Maps — no path toward provider-agnostic heatmaps.

- **Option 2: Use deck.gl `HeatmapLayer` with `GoogleMapsOverlay`**
  - deck.gl is a mature, GPU-accelerated visualization framework maintained
    by the OpenJS Foundation (vis.gl). Its `@deck.gl/google-maps` package
    provides `GoogleMapsOverlay`, which renders deck.gl layers directly on
    top of a Google Maps instance using the same WebGL context.
  - Pros: Accepts RGBA tuples natively (matches the structured `Color`
    type). Supports `colorDomain` for `[minIntensity, maxIntensity]`
    ranges. Provider-agnostic core — deck.gl also ships overlays for
    Mapbox GL and Leaflet, opening a path for future provider support.
    GPU-accelerated rendering. Actively maintained and widely adopted.
  - Cons: Adds a new external dependency (`@deck.gl/core`,
    `@deck.gl/aggregation-layers`, `@deck.gl/google-maps`). Property
    changes require rebuilding the layer instance and calling
    `overlay.setProps()` rather than using incremental setters.

## Decision Outcome

Chosen option: **Option 2 — deck.gl HeatmapLayer**, because it is the only
option that:

1. Eliminates the `google.maps.visualization.HeatmapLayer` dependency
   within the required timeline with acceptable implementation effort.
2. Natively supports the structured RGBA color model, eliminating the
   impedance mismatch between the OutSystems platform and the heatmap
   rendering backend.
3. Introduces `minIntensity` support through the `colorDomain` property,
   giving developers finer control over the heatmap's color distribution.
4. Decouples heatmap rendering from Google's Visualization library, placing
   the implementation in `src/Providers/Layers/deck.gl/` — a
   provider-agnostic location that aligns with the framework's architectural
   tenets.

Positive consequences:

- HeatmapLayer functionality survives Google's deprecation without requiring
  any changes from OutSystems developers — existing applications using the
  `HeatmapLayer.HeatmapLayer` block automatically get the deck.gl
  implementation.
- The new implementation works with structured colors and `minIntensity`
  out of the box.
- The deprecated Google-native heatmap remains available via a dedicated
  deprecated block (`HeatmapLayer.DEPRECATED_HeatmapLayer`), giving
  developers time to validate the new implementation before Google removes
  the Visualization library entirely.
- The deck.gl implementation lives under `Providers/Layers/` rather than
  `Providers/Maps/Google/`, establishing a precedent for provider-agnostic
  visualization layers that could be reused with Leaflet in the future.

Negative consequences:

- deck.gl is a substantial external dependency; its API may evolve and
  require maintenance when upgrading.
- Property changes are not incremental — each `changeProperty` call
  rebuilds the entire `deck.HeatmapLayer` instance and calls
  `overlay.setProps()`. In practice the performance impact is negligible
  because deck.gl performs internal diffing, but it is architecturally
  different from Google's setter-based approach.

## Implementation Details

### Coexistence strategy

The existing OutSystems block was originally named
`HeatmapLayer.HeatmapLayer` and used `google.maps.visualization.HeatmapLayer`
under the hood. With this change:

- The **deck.gl implementation takes over the original block name**
  (`HeatmapLayer.HeatmapLayer`). Existing applications using this block
  automatically switch to the deck.gl backend with no developer action
  required.
- The **Google-native implementation is moved to a new deprecated block**
  (`HeatmapLayer.DEPRECATED_HeatmapLayer`). Developers who need to stay on
  the Google Visualization heatmap temporarily can switch to this block, but
  it will stop working once Google retires v3.64 (February 2027).

| Implementation | Block tag | Notes |
|---|---|---|
| deck.gl | `HeatmapLayer.HeatmapLayer` | Takes over the original block name; default going forward |
| Google native | `HeatmapLayer.DEPRECATED_HeatmapLayer` | Renamed from the original; available until Google removes the Visualization library |

A `useDeckgl` parameter (default `true`) was added to
`HeatmapLayerManager.CreateHeatmapLayer()`. When `true`, the factory
delegates to `Provider.Layers.deckgl.HeatmapLayer.HeatmapLayerFactory`;
when `false`, it falls back to
`Provider.Maps.Google.HeatmapLayer.HeatmapLayerFactory`.

The legacy namespace (`MapAPI.HeatmapLayerManager`) does not pass
`useDeckgl`, so it inherits the default (`true`), routing callers to the
deck.gl implementation.

### Namespace and file structure

A new namespace `Provider.Layers.deckgl` was introduced under
`src/Providers/Layers/deck.gl/`:

| File | Role |
|---|---|
| `HeatmapLayer.ts` | Orchestrator. Creates a `deck.HeatmapLayer`, wraps it in a `deck.GoogleMapsOverlay`, and attaches it to the Google Maps instance. Handles property changes by rebuilding the layer and calling `setProps`. |
| `Factory.ts` | Factory method `MakeHeatmapLayer()` that instantiates the deck.gl `HeatmapLayer`. |
| `Constants.ts` | Default RGBA gradient (11 color stops) used when the developer does not provide a custom gradient. |
| `Configuration/HeatmapLayer/HeatmapLayerConfigs.ts` | Configuration class that transforms OS properties into `DeckglHeatmapLayerProps` — maps `points` to `getPosition`/`getWeight` accessors, `radius` to `radiusPixels`, and `minIntensity`/`maxIntensity` to `colorDomain`. |
| `Configuration/HeatmapLayer/IConfigurationHeatmapLayer.ts` | Interface extending the framework's `IConfigurationHeatmapLayer` with deck.gl-specific fields (`gradient` as `Color[]`, `minIntensity`). |

### Key design decisions within the implementation

**Gradient colors are RGBA tuples.** The deck.gl `HeatmapLayer` accepts
`colorRange` as an array of `[R, G, B, A]` tuples. The configuration class
stores the OS `Color` structure directly, and the `HeatmapLayer` class
converts it at render time via `_gradientColors()`. Hex values are supported
through `_hexToRgba()`.

**`colorDomain` enables min/max intensity.** When both `minIntensity` and
`maxIntensity` are set (and `min < max`), they are passed as a
`[min, max]` tuple to `colorDomain`. When both are `0` (the platform
default) or `min >= max`, `colorDomain` is set to `null`, letting deck.gl
auto-calculate the range.

**Layer rebuild on property change.** deck.gl layers are immutable by
design. To change a property, the implementation creates a new
`deck.HeatmapLayer` instance with updated configuration and passes it to
`overlay.setProps({ layers: [...] })`. deck.gl internally diffs the old and
new layer instances and only updates what changed, so the visual cost is
minimal.

**Runtime globals follow existing patterns.** `globalThis.deck.HeatmapLayer`
and `globalThis.deck.GoogleMapsOverlay` are expected to exist at runtime,
declared in `Global.d.ts` with type aliases (`DeckglHeatmapLayer`,
`DeckglHeatmapLayerProps`, `DeckglColor`, `DeckglGoogleMapsOverlay`). The
scripts are loaded by the Forge component at runtime, consistent with how
other external libraries (Google Maps, Leaflet plugins, TerraDraw) are
loaded.

### Framework layer changes

- `OS_Config_HeatmapLayer` enum: added `minIntensity`.
- `OSStructures.HeatmapLayer.Color`: new structured type with `red`,
  `green`, `blue`, `alpha`, and `hex` fields.
- `Helper.Constants`: `heatmapLayerTag` now points to the deck.gl block
  (original block name); added `heatmapLayerTag_deprecated` for the
  Google-native deprecated block.
- `IConfigurationHeatmapLayer`: added `minIntensity` to the framework
  configuration interface.
- `AbstractHeatmapLayer`: added abstract `blockTag` getter so each
  implementation can specify its associated OutSystems block.

## Links

- ROU-12633
- [Google Maps deprecation announcement](https://developers.google.com/maps/deprecations#heatmap)
- [deck.gl documentation](https://deck.gl/docs)
- [deck.gl HeatmapLayer API](https://deck.gl/docs/api-reference/aggregation-layers/heatmap-layer)
- [deck.gl GoogleMapsOverlay](https://deck.gl/docs/api-reference/google-maps/google-maps-overlay)

## Date

2026-04-07
