<!-- This is an ADR template, follow the same convention for future ADRs -->

# ADR-0002: Replace Google DrawingManager with Terra Draw

## Status

Accepted

## Context

Google announced the deprecation of the `DrawingManager` class from the Maps
JavaScript API. The timeline is as follows:

- **August 2025** – End-of-support announcement, coinciding with Maps JS API v3.62.
- **February 2026** – Last version that includes `DrawingManager` (v3.64) shipped to the weekly channel.
- **May 2026** – First version without `DrawingManager` (v3.65) shipped to the weekly channel.
- **February 2027** – v3.64 itself retired; `DrawingManager` unavailable in every active version.

OutSystems Maps relied on `DrawingManager` to provide its Drawing Tools feature —
the visual toolbar that lets end-users draw points, polylines, and polygons
directly on the map. Without a replacement, that feature would become entirely
non-functional for Google Maps users by May 2026 at the latest.

Additional constraints:

- The replacement must maintain API compatibility for OutSystems developers: the
  same client actions (`CreateDrawingTools`, `CreateTool`, `ChangeDrawingToolsProperty`,
  etc.) and the same `OnDrawingChange` event payload must continue to work without
  requiring changes to existing applications.
- The codebase already supports two map providers (Google Maps and Leaflet). The
  architectural tenets require provider-specific code to be isolated inside
  `src/Providers/Maps/<Provider>/`; the framework layer (`OSFramework/`) must
  remain provider-agnostic.
- Content Security Policy (CSP) is commonly enforced in enterprise OutSystems
  environments. Any new UI must avoid inline styles and inline scripts.

## Decision Drivers

- Eliminate the dependency on the deprecated `DrawingManager` before it is
  removed.
- Keep changes transparent to OutSystems developers (no breaking changes to
  client actions or events).
- Prefer a solution that can serve both the Google Maps and Leaflet providers,
  avoiding duplicated drawing logic.
- Maintain CSP compliance (no inline styles or scripts in the new UI).
- Minimise third-party surface area — prefer a library that is lightweight and
  actively maintained.

## Considered Options

- **Option 1: Build a custom drawing layer from scratch**
  - Pros: Full control; no new external dependencies.
  - Cons: Very high effort. Drawing geometries on a map correctly (snap, edit,
    drag, undo) is a large problem. Maintaining a custom solution long-term is
    expensive.

- **Option 2: Replace with another Google-native approach**
  - Google does not offer an official successor to `DrawingManager` within the
    Maps JS API. Using low-level `Polygon`/`Polyline` click listeners to
    re-implement drawing would effectively be Option 1 using Google's geometry
    primitives.
  - Pros: No new library dependency.
  - Cons: Same high implementation cost as Option 1, and still tightly coupled
    to Google Maps.

- **Option 3: Use Terra Draw**
  - Terra Draw is an open-source, actively maintained drawing library
    (`terra-draw`, MIT licence) designed specifically to be provider-agnostic.
    It ships separate adapters for Google Maps, Leaflet, Mapbox GL, and others,
    all backed by the same core drawing modes (`TerraDrawLineStringMode`,
    `TerraDrawPolygonMode`, `TerraDrawRectangleMode`, `TerraDrawCircleMode`,
    `TerraDrawMarkerMode`, `TerraDrawSelectMode`).
  - Pros: Provider-agnostic by design; covers both Google Maps and Leaflet with
    the same tool code; actively maintained; well-documented; lightweight core.
    Google itself cites Terra Draw as the recommended replacement.
  - Cons: Adds a new external dependency; third-party libraries are not
    supported by Google; some TerraDraw concepts (e.g., feature IDs, GeoJSON
    snapshots) require an integration layer.

## Decision Outcome

Chosen option: **Option 3 — Terra Draw**, because it is the only option that:

1. Eliminates the `DrawingManager` dependency within the required timeline with
   acceptable implementation effort.
2. Produces a solution that works identically across both map providers (Google
   Maps and Leaflet), honoring the framework's provider-abstraction tenet.
3. Is explicitly recommended by Google as the migration path.

Positive consequences:

- Drawing Tools functionality survives Google's deprecation without requiring
  any changes from OutSystems developers.
- The new implementation is structurally more provider-agnostic than the
  previous one: tool logic lives in `src/Providers/DrawingTools/TerraDraw/`
  rather than inside `src/Providers/Maps/Google/DrawingTools/`, making it
  reusable for the Leaflet provider in the future.
- CSP compliance is improved: the new toolbar uses only CSS classes for
  positioning and styling, with no inline styles.

Negative consequences:

- Terra Draw is a third-party dependency; its API may evolve and require
  maintenance when upgrading.
- The Google Maps adapter for Terra Draw (`@terra-draw/google-maps-adapter`) is
  an additional script that must be loaded at runtime alongside the core Terra
  Draw bundle.

## Implementation Details

### Transition strategy

A boolean feature flag `_internalUseTerraDraw` (default `true`) was added in
`DrawingToolsManager`. The framework-level factory (`OSFramework/Maps/DrawingTools/Factory.ts`)
routes to either the old `Provider.Maps.Google.DrawingTools` or the new
`Provider.DrawingTools.TerraDraw` implementation based on this flag. The old
Google implementation is retained temporarily so it can be re-enabled if a
critical regression is discovered. It will be removed once the new implementation
is proven stable.

### Class structure

A new namespace `Provider.DrawingTools.TerraDraw` was introduced under
`src/Providers/DrawingTools/TerraDraw/`. It contains:

| Class | Role |
|---|---|
| `DrawingTools` | Orchestrator. Creates the TerraDraw instance, routes `finish` events to the correct tool, and owns the `DrawingToolsUi`. |
| `DrawingToolsUi` | Pure DOM class that builds and manages the floating toolbar. Communicates via injected callbacks — no direct reference to TerraDraw. |
| `AbstractProviderTool<T>` | Base for all tools. Centralises `handleFinish` (creates the OS element and fires the framework event) and declares the abstract interface that concrete tools must implement. |
| `AbstractDrawShape<T>` | Extends `AbstractProviderTool`. Adds `createShapeElement` (delegates to the OS `ShapeFactory`) and wires the post-creation `shapeChangedEvent` for edits. |
| `AbstractDrawPolyshape<T>` | Extends `AbstractDrawShape`. Provides shared GeoJSON coordinate extraction for LineString and Polygon geometries. |
| `DrawPolyline` | Extends `AbstractDrawPolyshape`. Wraps `TerraDrawLineStringMode`. |
| `DrawPolygon` | Extends `AbstractDrawPolyshape`. Wraps `TerraDrawPolygonMode`. |
| `DrawRectangle` | Extends `AbstractDrawShape`. Wraps `TerraDrawRectangleMode`. Derives axis-aligned bounds from the GeoJSON Polygon ring. |
| `DrawCircle` | Extends `AbstractDrawShape`. Wraps `TerraDrawCircleMode`. Computes geodetic center (vertex average) and radius (Haversine) from the polygon approximation that TerraDraw stores. |
| `DrawMarker` | Extends `AbstractProviderTool` directly. Wraps `TerraDrawMarkerMode`. Creates an OS `IMarker` via `MarkerFactory.MakeMarker` and wires `dragend` for post-creation edits. |

Configuration classes (`DrawConfig`, `DrawBasicShapeConfig`, `DrawFilledShapeConfig`,
`DrawPolylineConfig`, `DrawMarkerConfig`) follow the existing configuration
transformation pattern: they extend `AbstractConfiguration`, expose OutSystems
property names, and implement `getProviderConfig()` to produce the corresponding
TerraDraw mode constructor options.

### Key design decisions within the implementation

**TerraDraw overlays are transient.** When TerraDraw fires a `finish` event, the
integration layer creates the permanent OS framework element (shape or marker),
then immediately removes the TerraDraw GeoJSON feature from its store. The
permanent shape is owned and rendered by the OS provider (Google Maps or
Leaflet), not by TerraDraw. This ensures that the edit and style behaviour of
completed shapes is consistent with shapes added programmatically.

**Finish events are centralised.** `DrawingTools._onFinish` is the single
handler for all TerraDraw `finish` events. It looks up the correct tool via a
`_modeToTool` map (keyed on TerraDraw mode name), delegates to
`tool.handleFinish(feature)`, and then resets TerraDraw to select mode. This
avoids each tool needing its own TerraDraw listener.

**UI toolbar is CSP-safe.** All positioning and styling is done via CSS classes
defined in `styles/DrawingTools.css`. Toolbar position (e.g. `TOP_LEFT`,
`RIGHT_CENTER`) is translated to a BEM modifier class at build time.
`flex-direction` is set to `row` for top/bottom positions and `column` for
side positions, matching the visual expectation for each placement.

**The `TerraDrawSelectMode` is always registered** alongside the drawing modes.
It acts as the neutral/idle state — the toolbar's "select" button activates it,
and `_onFinish` returns to it after every completed drawing.

## Links

- ROU-12638
- [Google Maps deprecation announcement](https://developers.google.com/maps/deprecations#drawing_library)
- [Terra Draw documentation](https://terradraw.io)
- [Terra Draw GitHub](https://github.com/JamesLMilner/terra-draw)
- [Google's Terra Draw migration sample](https://developers.google.com/maps/documentation/javascript/examples/terra-draw-layer)

## Date

2026-03-17