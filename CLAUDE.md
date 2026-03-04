# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

OutSystems Maps is a TypeScript library providing a unified API for Google Maps and Leaflet/OpenStreetMap integration in OutSystems Reactive Web applications. The library compiles to a single AMD module (`dist/OutSystemsMaps.js`) that abstracts provider differences behind framework interfaces.

**Foundation Documents:**
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for the provider abstraction pattern, architectural tenets (T1-T5), architecture diagram, and external integrations table
- See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for development workflow, branch naming, PR requirements, code standards, and member ordering rules

## Build and Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server at http://localhost:3000 with hot reload
npm run build            # Production build: clean + transpile + lintfix + lint
npm run lint             # Check ESLint errors/warnings
npm run lintfix          # Auto-fix ESLint issues
npm run prettier         # Format all JS/TS/CSS files
npm run docs             # Generate TypeDoc documentation
```

**Build System:** Gulp-based. Check `gulpfile.js` and `gulp/Tasks/` for task definitions. TypeScript compiles to single file via `tsconfig.json` `outFile: "./dist/OutSystemsMaps.js"`.

**Testing:** No automated tests exist in this repository (`npm test` exits with error). Tests are maintained in separate private repository [outsystems-maps-tests](https://github.com/OutSystems/outsystems-maps-tests). See [CONTRIBUTING.md Testing section](./.github/CONTRIBUTING.md#testing) for how to run tests locally via `gh repo clone`.

## Repository Structure

```
src/
├── OSFramework/Maps/          # Framework layer (provider-agnostic)
│   ├── Configuration/         # Config transformation interfaces
│   ├── Event/                 # Event management (MapEventsManager, MarkerEventsManager, etc.)
│   ├── Feature/               # Feature abstractions (Directions)
│   ├── Marker/                # Marker abstractions
│   ├── Shape/                 # Shape abstractions (Polygon, Polyline, Circle)
│   ├── OSMap/                 # Map abstractions
│   ├── DrawingTools/          # Drawing tools abstractions
│   ├── FileLayer/             # File layer abstractions (KML, GeoJSON)
│   ├── HeatmapLayer/          # Heatmap abstractions
│   └── SearchPlaces/          # Places search abstractions
├── Providers/Maps/            # Provider implementations
│   ├── Google/                # Google Maps adapter
│   └── Leaflet/               # Leaflet/OSM adapter
├── OutSystems/Maps/           # Public API
│   ├── MapAPI/                # Map management (MapManager, MarkerManager, ShapeManager, Directions, etc.)
│   └── PlacesAPI/             # Places search
└── Files/                     # Static assets (loaded at runtime)
    ├── Google/                # Google Maps scripts
    ├── Leaflet/               # Leaflet scripts/styles
    │   └── Directions/        # Routing backend extensions (GraphHopper, TomTom)
    └── Internal/              # Internal assets
```

**Key Separation:** `OSFramework/` defines interfaces and abstractions. `Providers/` contains Google Maps and Leaflet implementations. `OutSystems/` exposes the public API. See [ARCHITECTURE.md T1](./ARCHITECTURE.md#t1-provider-abstraction-must-isolate-external-dependencies) for provider isolation enforcement.

## Important Context

### Map Provider Architecture

The library supports two map providers selected at runtime:
- **Google Maps:** Requires API key, provides full Google Maps JavaScript API capabilities (geocoding, places search, marker clustering via `@googlemaps/markerclusterer` v2.5.3, advanced markers, directions via Google Routes API)
- **Leaflet:** Open-source library for mobile-friendly interactive maps (~42 KB, no dependencies), uses OpenStreetMap tiles (no API key required), extensible with Leaflet plugins

Provider selection happens in `OSFramework/Maps/OSMap/Factory.ts` via `MapFactory.MakeMap()`. All provider-specific code is isolated in `Providers/` directories.

**Directions/Routing:** Both providers support calculating routes between points. Google uses Routes API (`routes.googleapis.com/directions/v2:computeRoutes`). Leaflet uses [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) v3.2.12 with pluggable backends (OSRM default, plus GraphHopper/TomTom extensions in `Files/Leaflet/Directions/`). See [ARCHITECTURE.md External Integrations table](./ARCHITECTURE.md#external-integrations) for integration details.

**Drawing Tools:** Both providers support interactive drawing and editing of geometries:
- **Google:** Uses native Drawing Manager API
- **Leaflet:** Combines three libraries:
  - [Leaflet.Draw](https://github.com/Leaflet/Leaflet.draw) v1.0.4 - Provides drawing toolbar UI (`L.Control.Draw`) with handlers for polylines, polygons, rectangles, circles, markers
  - [Leaflet.Editable](https://github.com/Leaflet/Leaflet.Editable) v1.3.0 - Enables programmatic geometry editing on individual layers
  - [Leaflet.Path.Drag](https://github.com/w8r/Leaflet.Path.Drag) v1.9.5 - Adds drag capabilities to vector features (polygons, polylines), mirroring marker drag API with dragstart/drag/dragend events

Implementation in `src/Providers/Maps/Leaflet/DrawingTools/DrawingTools.ts` uses Leaflet.Draw for toolbar control and drawing modes. Maps initialize with `{editable: true}` option, then editing is enabled on individual layers via Leaflet.Editable. See [ARCHITECTURE.md External Integrations table](./ARCHITECTURE.md#external-integrations) for versions and external dependencies.

### Configuration Pattern

User configuration flows: JSON string → framework config object → provider-specific options.

Example flow:
1. `OutSystems.Maps.MapAPI.MapManager.CreateMap()` accepts JSON config string
2. Parsed into `OSFramework.Maps.Configuration.*` objects
3. `getProviderConfig()` transforms to `google.maps.MapOptions` or `L.MapOptions`

See [ARCHITECTURE.md T4](./ARCHITECTURE.md#t4-configuration-transformation-occurs-at-provider-boundaries) for configuration transformation contract.

### Event System

All events flow through framework event managers (`OSFramework/Maps/Event/`):
- Provider implementations trigger framework events, not direct callbacks
- `AbstractEventsManager` handles subscription/dispatch consistently
- User callbacks never receive provider-specific event objects

See [ARCHITECTURE.md T5](./ARCHITECTURE.md#t5-events-flow-through-framework-event-managers) for event flow details.

### Component Lifecycle

Framework layer controls all lifecycle via abstract classes:
- `build()` → initialize provider component
- `finishBuild()` → trigger event cascade
- `dispose()` → cleanup

Provider implementations respond to framework commands but do not manage their own lifecycle. Framework maintains parent-child relationships (maps contain markers, shapes, file layers, features).

See [ARCHITECTURE.md T3](./ARCHITECTURE.md#t3-framework-layer-owns-lifecycle-and-state-management) for lifecycle ownership details.

## Code Standards

See [CONTRIBUTING.md Code Standards section](./.github/CONTRIBUTING.md#code-standards) for complete code standards.

**Quick reference:**
- Private properties/methods: `_strictCamelCase` (leading underscore required)
- Public/protected: `strictCamelCase` (no underscore)
- Interfaces: `IPascalCase` (must start with `I`)
- Exported functions/classes: `StrictPascalCase`
- Member ordering: private fields → protected fields → public fields → constructor → private methods → protected methods → public methods (alphabetical within each group, enforced by ESLint)

## Documentation

Document public APIs with JSDoc comments. Type `/**` above functions for templates (VS Code "Document This" extension).

Architectural decisions documented in `docs/adr/`. Use `docs/adr/ADR-0000-Title-of-ADR.md` as template. Existing ADRs:
- `ADR-0001-Google-Markers-Draw-Performance.md` - Disables draw during marker addition but keeps repaint after addition to optimize marker clustering performance

## PR Requirements

See [CONTRIBUTING.md Pull Request Requirements section](./.github/CONTRIBUTING.md#pull-request-requirements) for complete PR requirements.

**Critical:** PRs must include:
- Link to sample page demonstrating the change
- Problem description ("What was happening?")
- Solution description ("What was done?")
- Test steps and screenshots/GIFs
- At least one label: `feature`, `bug`/`bugfix`, `dependencies`, `chore`

**Branch pattern:** `<JIRA-ID>` or `<JIRA-ID>-description` (e.g., `ROU-12619`)
**PR title format:** `<JIRA-ID> <description>` (e.g., `ROU-12619 Fix marker clustering performance`)

## Common Tasks

**Adding a new map provider:**
1. Create provider directory: `src/Providers/Maps/<NewProvider>/`
2. Implement interfaces from `src/OSFramework/Maps/`
3. Add factory logic in `src/OSFramework/Maps/OSMap/Factory.ts`
4. Create configuration transformer in provider's `Configuration/` directory
5. Follow [ARCHITECTURE.md T1](./ARCHITECTURE.md#t1-provider-abstraction-must-isolate-external-dependencies) - no framework changes should be needed

**Adding a new map feature:**
1. Define interface in `src/OSFramework/Maps/<Feature>/I<Feature>.ts`
2. Create abstract class in `src/OSFramework/Maps/<Feature>/Abstract<Feature>.ts`
3. Implement in each provider: `src/Providers/Maps/Google/<Feature>/` and `Leaflet/<Feature>/`
4. Add factory method in `src/OSFramework/Maps/<Feature>/Factory.ts`
5. Expose in public API: `src/OutSystems/Maps/MapAPI/<Feature>Manager.ts`

**Modifying provider-specific behavior:**
- Google Maps: `src/Providers/Maps/Google/`
- Leaflet: `src/Providers/Maps/Leaflet/`
- Never import provider types into `OSFramework/` or `OutSystems/` namespaces (see [ARCHITECTURE.md T2](./ARCHITECTURE.md#t2-public-api-must-return-framework-interfaces-not-provider-types))

## Links

- **Forge component - O11:** https://www.outsystems.com/forge/component-overview/9909/outsystems-maps-o11
- **Forge component - ODC:** https://www.outsystems.com/forge/component-overview/15930/outsystems-maps-odc
- **Sample app:** https://www.outsystems.com/forge/component-overview/10984/outsystems-maps-sample
- **Living docs:** https://outsystemsui.outsystems.com/OutSystemsMapsSample/
- **Official docs:** https://success.outsystems.com/Documentation/11/Developing_an_Application/Design_UI/Patterns/Using_Mobile_and_Reactive_Patterns/Map
- **Support:** https://www.outsystems.com/forge/component-discussions/9909/OutSystems+Maps
- **Tests repository:** https://github.com/OutSystems/outsystems-maps-tests
