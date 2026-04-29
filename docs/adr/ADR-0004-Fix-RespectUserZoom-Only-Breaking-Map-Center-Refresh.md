<!-- This is an ADR template, follow the same convention for future ADRs -->

# ADR-0004: Fix map center not refreshing when only respectUserZoom is active

## Status

Accepted

## Context

The map component supports two independent flags that allow the developer to opt into respecting changes made by the end user:

-   `respectUserZoom` — when enabled, if the user manually changes the zoom level, the map will not override it on refresh.
-   `respectUserPosition` — when enabled, if the user manually pans the map, the map will not override its center position on refresh.

Each flag sets a corresponding private boolean (`_zoomChanged`, `_positionChanged`) when the user interacts with the map, and clears it when the flag itself is reconfigured.

Before this fix, the `refresh` method in both Google and Leaflet provider implementations determined whether to keep the current map center using a single combined getter:

```ts
// AbstractMap.ts (before)
public get respectUserChange(): boolean {
    return this.config.respectUserZoom || this.config.respectUserPosition;
}

public get hasZoomOrPositionChanged(): boolean {
    return this._zoomChanged || this._positionChanged;
}

// Provider OSMap.ts (before)
if (this.respectUserChange && this.hasZoomOrPositionChanged) {
    position = this.provider.getCenter()...;
}
```

This produced incorrect behaviour in a specific scenario:

1. Developer enables only `respectUserZoom` (position respect is **off**).
2. User manually changes the zoom level → `_zoomChanged = true`.
3. Something external updates the map center programmatically (e.g. a marker position changes) → `refresh` is called.
4. Because `respectUserChange` was `true` (zoom flag is on) **and** `hasZoomOrPositionChanged` was `true` (zoom changed), the condition evaluated to `true`.
5. As a result, `position` was overwritten with the *current* map center instead of the new programmatic value, so the map never re-centred.

The root cause is that `hasZoomOrPositionChanged` aggregated both `_zoomChanged` and `_positionChanged` into a single boolean, conflating two independent concerns. A zoom change alone was enough to prevent a programmatic position update from taking effect, even when `respectUserPosition` was disabled.

Constraints:

-   The fix must not alter the existing behaviour of `respectUserZoom` (zoom level must still be preserved when the user has zoomed).
-   The fix must not alter the existing behaviour of `respectUserPosition` (center must still be preserved when the user has panned).
-   Changes must remain minimal and localised to the framework abstraction and provider refresh logic.

## Decision Drivers

-   Correct separation of zoom and position concerns.
-   Minimal change surface — avoid regressions in unaffected scenarios.
-   Consistent fix across both Google Maps and Leaflet providers.

## Considered Options

-   **Option 1:** Keep the combined getter approach but fix the guard condition in each provider to check the flags independently.
    -   Pros: Requires changes only in the provider files, leaving `AbstractMap` untouched.
    -   Cons: Duplicates the "flag AND changed" logic in every provider; the abstraction layer still exposes misleading helpers.

-   **Option 2:** Replace the combined `respectUserChange` / `hasZoomOrPositionChanged` getters with a single, self-contained `respectUserPosition` getter in `AbstractMap` that encapsulates both the flag check and the changed state.
    -   Pros: The logic lives in one place. Provider code becomes a simple property read. The removed `hasZoomOrPositionChanged` getter eliminates accidental misuse.
    -   Cons: Removes a previously public getter (`hasZoomOrPositionChanged`), which is a minor breaking-change risk for any external consumer that used it directly.

## Decision Outcome

Chosen option: **Option 2**, because it produces the clearest abstraction: each "respect" concern is fully encapsulated by its own getter, and providers no longer need to combine two properties to make a decision. The removed getter (`hasZoomOrPositionChanged`) and the renamed getter (`respectUserChange` → `respectUserPosition`) had no external callers outside the two provider files, so the risk is negligible.

Changes made:

1.  **`src/OSFramework/Maps/OSMap/AbstractMap.ts`**
    -   Removed `hasZoomOrPositionChanged` getter.
    -   Replaced `respectUserChange` getter (which returned `respectUserZoom || respectUserPosition`) with a focused `respectUserPosition` getter that returns `!!this.config.respectUserPosition && this._positionChanged`.
    -   The equivalent for zoom already existed as `allowRefreshZoom` (returns `!(respectUserZoom && _zoomChanged)`), so no new getter was needed for that concern.

2.  **`src/Providers/Maps/Google/OSMap/OSMap.ts`** and **`src/Providers/Maps/Leaflet/OSMap/OSMap.ts`**
    -   Replaced the combined guard `this.respectUserChange && this.hasZoomOrPositionChanged` with the single `this.respectUserPosition`.
    -   Added null-safe fallback (`?? position`) when `getCenter()` unexpectedly returns `null`/`undefined`.

Positive consequences:

-   Programmatic map center updates now work correctly when only `respectUserZoom` is enabled and the user has previously changed the zoom level.
-   The position-respect logic is expressed once in the framework layer; providers contain no duplicate logic.
-   Null-safety improvement in both providers' `getCenter()` calls.

Negative consequences:

-   `hasZoomOrPositionChanged` and `respectUserChange` are no longer part of the public API of `AbstractMap`. Any hypothetical external code relying on those getters would need to be updated.

## Links

-   ROU-12729

## Date

2026-04-20
