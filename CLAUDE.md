# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

OutSystems Maps is a TypeScript library providing a unified API for Google Maps and Leaflet/OpenStreetMap integration in OutSystems Reactive Web applications. The library compiles to a single AMD module (`dist/OutSystemsMaps.js`) that abstracts provider differences behind framework interfaces.

**Foundation Documents:**
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for the provider abstraction pattern, architectural tenets (T1-T5), and external integrations table
- See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for development workflow, PR requirements, and code standards

## Build and Development Commands

**Setup and Development:**
```bash
npm install              # Install dependencies
npm run dev              # Start dev server at http://localhost:3000 with hot reload
```

**Build and Quality:**
```bash
npm run build            # Production build: clean + transpile + lintfix + lint
npm run lint             # Check ESLint errors/warnings
npm run lintfix          # Auto-fix ESLint issues
npm run prettier         # Format all JS/TS/CSS files
npm run docs             # Generate TypeDoc documentation
```

**Note:** No automated tests exist in this repository (`npm test` exits with error). Automated tests are maintained in the separate [outsystems-maps-tests](https://github.com/OutSystems/outsystems-maps-tests) repository.

**Build System:** Gulp-based. Check `gulpfile.js` and `gulp/Tasks/` for task definitions. TypeScript compiles to single file via tsconfig `outFile: "./dist/OutSystemsMaps.js"`.

## Repository Structure

```
src/
├── OSFramework/Maps/          # Framework layer (provider-agnostic)
│   ├── Configuration/         # Config transformation interfaces
│   ├── Event/                 # Event management (MapEventsManager, MarkerEventsManager, etc.)
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
│   ├── MapAPI/                # Map management (MapManager, MarkerManager, ShapeManager, etc.)
│   └── PlacesAPI/             # Places search
└── Files/                     # Static assets
    ├── Google/                # Google Maps scripts
    └── Leaflet/               # Leaflet scripts/styles
```

**Key Separation:** `OSFramework/` defines interfaces and abstractions. `Providers/` contains Google Maps and Leaflet implementations. `OutSystems/` exposes the public API. See [ARCHITECTURE.md T1](./ARCHITECTURE.md#t1-provider-abstraction-must-isolate-external-dependencies) for provider isolation details.

## Testing and Verification

Automated tests are maintained in a separate private repository: [outsystems-maps-tests](https://github.com/OutSystems/outsystems-maps-tests)

**To run tests locally (requires gh CLI):**
```bash
# Clone the tests repository
gh repo clone OutSystems/outsystems-maps-tests ../outsystems-maps-tests

# Run tests
cd ../outsystems-maps-tests
npm run local -- --browsers=chrome --environment=dev --map=web
```

**Manual testing via dev server:**
1. Start dev server: `npm run dev`
2. Test changes at `http://localhost:3000`
3. Reference sample app: https://www.outsystems.com/forge/component-overview/10984/outsystems-maps-sample
4. Check component living docs: https://outsystemsui.outsystems.com/OutSystemsMapsSample/

## Important Context

### Map Provider Architecture

The library supports two map providers selected at runtime:
- **Google Maps:** Requires API key, provides full Google Maps JavaScript API capabilities (geocoding, places search, marker clustering, advanced markers)
- **Leaflet:** Open-source library for mobile-friendly interactive maps (~42 KB, no dependencies), uses OpenStreetMap tiles (no API key required)

Provider selection happens in `OSFramework/Maps/OSMap/Factory.ts` via `MapFactory.MakeMap()`. All provider-specific code is isolated in `Providers/` directories.

**Leaflet Characteristics:**
- Design philosophy: simplicity, performance, usability
- Supports tile layers, markers with popups, vector geometries, image overlays, GeoJSON
- Hardware acceleration on mobile, CSS-driven smooth panning/zooming
- Custom map projections (EPSG:3857/4326/3395)
- BSD 2-Clause License (highly permissive open-source)

**External Context Note:** The external context provided information about the Leaflet library from its GitHub repository. This information is consistent with the codebase's use of Leaflet as one of the two supported map providers. The library size (~40 KB gzipped) and design principles match the implementation observed in `src/Providers/Maps/Leaflet/`.

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

Provider implementations respond to framework commands but do not manage their own lifecycle. Framework maintains parent-child relationships (maps contain markers, shapes, file layers).

See [ARCHITECTURE.md T3](./ARCHITECTURE.md#t3-framework-layer-owns-lifecycle-and-state-management) for lifecycle ownership details.

## Code Standards

**Member Ordering (enforced by ESLint):**
1. Private fields (`_name`)
2. Protected fields
3. Public fields
4. Constructor
5. Private methods
6. Protected methods
7. Public methods

Within each group: alphabetical order.

**Naming:**
- Exported functions: `StrictPascalCase`
- Interfaces: `IPascalCase` (must start with `I`)
- Private properties/methods: `_strictCamelCase` (leading underscore required)
- Public/protected: `strictCamelCase` (no underscore)

**Formatting:** Single quotes, semicolons required, 120 char width, tabs (width 4). Prettier config in `.prettierrc.json`.

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md#code-standards) for complete standards.

## Documentation

Document public APIs with JSDoc comments. Type `/**` above functions for templates (VS Code "Document This" extension).

Architectural decisions documented in `docs/adr/`. Use `docs/adr/ADR-0000-Title-of-ADR.md` as template. Existing ADRs:
- `ADR-0001-Google-Markers-Draw-Performance.md` - Addresses marker clustering draw performance by disabling draw during addition but keeping repaint after addition

## PR Requirements

**Critical:** PRs must include:
- Link to sample page demonstrating the change
- Problem description ("What was happening?")
- Solution description ("What was done?")
- Test steps
- Screenshots or GIFs

**Labels Required:** At least one of `feature`, `bug`/`bugfix`, `dependencies`, `chore`. Avoid `do not merge` label.

**Branch:** Create from `dev` with pattern `<JIRA-ID>` or `<JIRA-ID>-description` (e.g., `ROU-12619`)

**PR Title:** Must match regex `^([A-Z][A-Z0-9]*-\d+(:)?\s\w)` (e.g., `ROU-12619 Fix marker clustering performance`)

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md#pull-request-requirements) for complete PR requirements.

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

- **Forge component:** https://www.outsystems.com/forge/component-overview/9909/outsystems-maps
- **Sample app:** https://www.outsystems.com/forge/component-overview/10984/outsystems-maps-sample
- **Living docs:** https://outsystemsui.outsystems.com/OutSystemsMapsSample/
- **Official docs:** https://success.outsystems.com/Documentation/11/Developing_an_Application/Design_UI/Patterns/Using_Mobile_and_Reactive_Patterns/Map
- **Support:** https://www.outsystems.com/forge/component-discussions/9909/OutSystems+Maps
- **Tests repository:** https://github.com/OutSystems/outsystems-maps-tests
