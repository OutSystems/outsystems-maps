<!-- This is an ADR template, follow the same convention for future ADRs -->

# ADR-0007: Fix the Leaflet Directions route request lifecycle (in-flight removal, redundant requests and routing errors)

## Status

Proposed

## Context

The Leaflet provider renders directions with leaflet-routing-machine (LRM) 3.2.12, an external library bundled in
`src/Files/Leaflet/Leaflet.Routing.Machine.js` that must not be modified. `Provider.Maps.Leaflet.Feature.Directions`
wraps one LRM routing control (`_directionsRenderer`) per plugin load.

ROU-12127 reported an uncaught exception on the `Map_DirectionsLeaflet` sample when waypoints are added (or GO is pressed)
before the previous route finished drawing:

```
Uncaught TypeError: Cannot read properties of null (reading 'removeLayer')
    at e._clearLines (LeafletRoutingMachine.js:16589)
    at e.<anonymous> (LeafletRoutingMachine.js:16561)   // Control.route callback
    at e.<anonymous> (LeafletRoutingMachine.js:18555)   // router callback
    at XMLHttpRequest.loaded
```

### How the exception happens

-   The sample runs `LoadPlugin` → `SetDirections` → `GetTotalDistance` → `GetTotalDuration` on every GO and map click,
    so every action calls `setPlugin()`, which `dispose()`s the previous control.
-   `dispose()`, `removeRoute()` (RemoveDirections) and map destruction all reach `setState(false)`, which called
    `map.removeControl(control)`. Leaflet's `Control.remove()` sets the control's `_map` to `null`.
-   LRM only cancels a pending request when the same control starts a new one (`route()` aborts `_pendingRequest` and
    increments `_requestCount`). Removing the control does neither, so the request keeps going.
-   When its response arrives, LRM's callback still matches `_requestCount`, so it runs `_clearLines()` →
    `this._map.removeLayer(...)` (or `_updateLines` → `line.addTo(null)` / `fitBounds`) on a `null` map.

The race was reproduced on the dev sample (2 GO clicks ~150 ms apart; GO then "Remove Directions"; consecutive map
clicks). Calling `SetDirections` repeatedly on the **same** control (no `LoadPlugin` in between) did not throw, because
LRM's `_requestCount` guard already discards stale responses there.

### Related defects found while investigating

1.  **Redundant route requests.** Each `setRoute` on a control already on the map made 3 requests: an explicit
    `route({})` and the `addTo()` re-add (Leaflet removes and re-adds the control; LRM's `onAdd` calls `route()`), both
    with the **previous** waypoints, plus the real one from `setWaypoints`. Measured: 6 requests for 2 `SetDirections`.
2.  **Routing errors were ignored.** LRM fires `routingerror` (not `routesfound`) when routing fails (no route, network
    error, timeout). Only `routesfound` was handled: the failure was only logged by LRM (`Routing error:` in the console,
    the second screenshot of the ticket), and `GetTotalDistance`/`GetTotalDuration` calls waiting for the route never
    resolved.
3.  **Waiting `GetTotal*` calls could break each other.** The handler removed the listener stored in
    `_bindDistance`/`_bindDuration` (the latest one), not the one that ran. A listener whose route never finished stayed
    attached, ran on the next route and removed the newer listener, so the newer call never resolved (verified on
    Leaflet 1.9.4).

### Constraints

-   No changes to LRM or any other external file in `src/Files/`.
-   Keep the public API (`OutSystems.Maps.MapAPI.Directions.*`) and the `IDirections` contract unchanged.
-   Keep the change inside the Leaflet provider (ARCHITECTURE.md T1) and report errors through the framework events
    (T5).
-   Keep the private names used by the E2E tests: `_currentDistance`, `_currentDuration`, `_directionsRenderer`.

## Decision Drivers

-   Remove the exception at its root cause, for every path that removes the control (LoadPlugin, RemoveDirections,
    map destroy).
-   Smallest change that is correct; no new runtime dependency.
-   No change to the success-path timing of `SetDirections` (apps chain other actions on it).
-   Routing failures must reach the developer, and no API call may wait forever.
-   Behaviour pinned by E2E tests that fail on the old build.

## Considered Options

-   **Option 1: Serialize `setRoute` calls (FIFO queue) and make `SetDirections` wait for the route** (first proposal in
    the ticket analysis).
    -   Pros: every call gets its own result; Google-like behaviour.
    -   Cons: does not address the actual trigger (the control being removed while a request is in flight); ~120 changed
        lines; changes `SetDirections` timing for every app; needs timeouts and cancellation of queued calls.
-   **Option 2: Patch LRM** to abort the pending request in `onRemove` and null-check `_map` in its callbacks.
    -   Pros: fixes the root cause where it lives.
    -   Cons: violates the "no external file changes" constraint; lost on the next LRM update.
-   **Option 3: Cancel the in-flight request from the wrapper before removing the control, plus targeted fixes for the
    related defects.**
    -   Pros: fixes the root cause through LRM's public API; small change; `SetDirections` timing unchanged.
    -   Cons: Leaflet still reports routing failures through OnError while Google reports them in the `SetDirections`
        result (documented below).

## Decision Outcome

Chosen option: **Option 3**, because it is the only option that fixes the root cause without modifying an external
file or changing the success-path timing of `SetDirections`.

### Changes made — `outsystems-maps`

1.  **`src/Providers/Maps/Leaflet/Features/Directions.ts`**
    -   **Cancel the pending request on removal (the ticket fix).** `setState(false)` calls `setWaypoints([])` while the
        control is still on the map, then `removeControl`. LRM's `Plan` pads the waypoints to two empty ones and fires
        `waypointschanged` → `route({})`, which increments `_requestCount` and aborts the request. The plan isn't ready,
        so no new request starts, and `_clearLines()` runs with a valid map. A late response is then ignored by LRM's
        own `ts === _requestCount` check, even for routers without `abort` (GraphHopper, TomTom).
    -   **Idempotent `setState`.** It only adds or removes the control when the state actually changes. Re-adding an
        enabled control would make LRM re-request the previous waypoints. `setRoute` now simply calls
        `setState(true)`.
    -   **One request per `setRoute`.** The explicit `route({})` call was removed; `setWaypoints` (which always fires
        `waypointschanged`) is the single trigger.
    -   **Routing errors raise OnError, once.** `_buildDirectionsRenderer` registers a `routingerror` listener that calls
        `OSFramework.Maps.Helper.ThrowError(map, LIB_FailedSetDirections, <provider message or status>)`. It is raised
        once per failed route; `GetTotal*` calls made afterwards return 0 without raising it again. The message falls
        back to `undefined` (not the text "undefined") so `ThrowError` applies its empty-message default.
    -   **Waiting `GetTotal*` calls always settle.**
        -   They are handled by `_waitForRouteTotal`. Each waiter removes **itself** from both events (fixes defect 3)
            and is tracked in `_pendingTotalListeners` (replaces `_bindDistance`/`_bindDuration`).
        -   On `routingerror` the totals become 0 and waiters resolve with 0.
        -   When a request is cancelled (`setState(false)`), `_settlePendingTotals()` resolves waiters with the known
            totals, or 0 when unknown.
    -   **Invalid coordinates keep the current route's totals.** The NaN reset was moved after the plugin and
        travel-mode checks; on a coordinate validation failure, `setRoute` restores the previous totals and answers
        waiting calls. Without this, removing `route({})` would have left `GetTotal*` waiting forever after a rejected
        `SetDirections` on a reused control.
    -   **Readability.** `_routesFoundHandler` was renamed `_routeOutcomeHandler`. The `routesfound` + `routingerror`
        registration pair lives in `_onRouteOutcome`/`_offRouteOutcome`. The JSDoc now lists the real parameters.
2.  **`src/Providers/Maps/Leaflet/Features/ILeafletRoutingControl.ts`** — added `IRoutingErrorEvent` and
    `IRoutingResultEvent` for the LRM event payloads (previously inline object types).
3.  **`src/Providers/Maps/Leaflet/Constants/Directions/DirectionsEvents.ts`** — added `routingerror` to `Events` and
    fixed the enum description (it described OSRM travel modes).
4.  **`src/OutSystems/Maps/MapAPI/Directions.ts`** — JSDoc of `SetDirections`, `GetTotalDistanceFromDirection` and
    `GetTotalDurationFromDirection` documents the Leaflet behaviour (see below).

### Behaviour changes (Leaflet provider only)

| Situation | Before | After |
| :-- | :-- | :-- |
| Directions removed / plugin reloaded while a route is calculated | Uncaught `TypeError` in LRM | No error; request cancelled |
| `SetDirections` on a control already on the map | 3 routing requests | 1 routing request |
| Routing service fails | Console log only; `SetDirections` already returned success | Map OnError `MAPS-LIB-04001` with the provider message, raised once per failed route |
| `GetTotal*` waiting for a route that fails | Never resolves | Resolves 0 |
| `GetTotal*` called after a route failed | Waited forever | Returns 0 (no extra OnError) |
| `GetTotal*` waiting for a route that gets removed / replaced | Never resolves (or resolved with another route's value) | Resolves 0 |
| `SetDirections` with invalid coordinates on a reused control | Previous route re-requested and its totals refreshed | Previous route kept, totals restored, no request |
| `getWaypoints()` after `RemoveDirections` | Previous waypoints | Two empty waypoints (not exposed by any public API) |

`SetDirections` still resolves as soon as the route request starts; with Leaflet its result only covers the options
validation. This differs from Google, whose `SetDirections` waits for the Routes API and returns routing failures in
its result. The difference is now documented in the JSDoc and should also be reflected in the action descriptions and
release notes.

### Changes made — `outsystems-maps-tests`

-   **Instrumentation helper** — `tests/helpers/page-instrumentation.ts` keeps everything it captures under one page
    global:
    -   uncaught errors and Map OnError events;
    -   an in-page XHR interceptor for the directions providers that can delay or fail requests and counts them. It
        honours `abort()` the way a browser does and works on every CI browser, including Safari (no WebDriver BiDi
        dependency);
    -   a non-blocking `GetTotalDistanceFromDirection` call.
-   **Steps** — `sample-steps/directions-steps.ts` (new) has the directions-specific steps (delay/fail/count requests,
    wait until N requests, `SetDirections`/`GetTotalDistance` through the API, click on the directions map). The generic
    error and OnError capture steps went to `common-steps.ts` / `common-validations.ts`.
-   **Page objects** — `MapReactive.scrollIntoView()`, plus `SampleCommon.getDirectionTotalDuration()` /
    `getDirectionTotalDistance()`, which the existing "close to" steps now use. The provider URL pattern is in
    `Constants.directionsProvidersRequestPattern`.
-   **Scenarios** (`directions.feature`, `@reactive @leaflet @directions`):
    1. Set Directions again before the previous route is drawn.
    2. Remove Directions before the route is drawn.
    3. Set Directions after removing them before the route was drawn.
    4. Add waypoints on the map before the previous route is drawn.
    5. Routing provider failure triggers the OnError event (code, message, raised exactly once, totals become 0).
    6. Remove Directions answers the total distance requested while the route is calculated.
    7. Set Directions with invalid coordinates keeps the totals of the current route.
    8. Set Directions via API makes a single request per call.

### Verification (Chrome)

-   Against the deployed dev build (unfixed), all 7 race and behaviour scenarios fail with the expected reasons:
    -   the ticket's `TypeError`;
    -   no OnError;
    -   6 requests instead of 2.

    Scenario 7 passes there, because it guards a regression an intermediate version of this change introduced. All
    existing Leaflet scenarios pass.
-   With the local build, all 26 `@directions` scenarios pass, Leaflet and Google.

Positive consequences:

-   The ticket exception is gone for every removal path, without touching external files.
-   Fewer requests to the routing providers (rate limits and quotas).
-   Routing failures reach the developer through OnError, and no Directions API call waits forever.

Negative consequences:

-   Leaflet and Google report routing failures through different channels (OnError vs. the `SetDirections` result).
-   Apps that read `GetTotal*` after a failure get 0, so they must use OnError to tell a failure apart from an empty
    route.
-   New OnError events may surface in apps that already have an OnError handler (previously the failure was silent).

Known issues not addressed here:

-   `npm run build` can produce an empty `dist/`: `cleanOldFiles` in `gulpfile.js` starts an asynchronous delete without
    waiting for it, so the delete can remove the freshly built bundle.

## Links

-   ROU-12127
-   leaflet-routing-machine 3.2.12 (`src/Files/Leaflet/Leaflet.Routing.Machine.js`): `Control.route`,
    `Control._clearLines`, `Control.onAdd`, `Plan.setWaypoints`
-   ADR-0004 (format reference for bug-fix ADRs)

## Date

2026-10-25
