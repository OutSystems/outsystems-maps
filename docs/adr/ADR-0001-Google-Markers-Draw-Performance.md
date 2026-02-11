<!-- This is an ADR template, follow the same convention for future ADRs -->

# ADR-0001: Google Markers and Marker Cluster draw phase

## Status

Accepted

## Context

When a developer places a large number of Markers on a map with clustering enabled, the rendering process becomes overwhelming. This causes the browser to freeze, resulting in significant delays before the Markers and Marker Clusters appear to the user.

After investigation, it was perceived that adding Markers to the cluster was the root cause of this behavior. Specifically, every time a new Marker is added to a cluster, a redraw is triggered using the existing visual tree. The operation to add a new Marker to the visual tree is computationally expensive and causes the browser to crash or hang.

Furthermore, in a method called after the addition of the Marker to the cluster, a repaint of the Marker Cluster is triggered. This action is less expensive than the "redraw after add" because it creates a new visual tree rather than modifying the existing one.

Constraints:

-   Avoid breaking changes for the developer and the runtime experience.
-   Keep fixes minimal and localized so they are easier for developers to adopt.

## Decision Drivers

-   Keep changes minimal and reversible.
-   Maintain existing behavior.
-   Improve the performance of the overall interaction.

## Considered Options

-   Option 1: Create new client actions for bulk additions
    -   Pros: This would optimize the overall draw flow, making it as efficient as possible. It avoids multiple redraws by calling for a repaint only after all new Markers are added.

    -   Cons: This would require a higher effort from developers to implement the changes. Additionally, it would necessitate further documentation and significant changes to the codebase to achieve the desired behavior.
-   Option 2: Disable draw on addition moment but keep the repaint after addition
    -   Pros: The difference in performance is significant. It would require no changes for developers to adopt and no need for new documentation.
    -   Cons: Some discarded repaints will occur, meaning the performance will not be theoretically optimal, though still improved.

## Decision Outcome

Chosen option: "Option 1", because it is the only option that allows for performance benefits to reach the majority of users and developers quickly. It is also the best option to ensure that minimal changes are implemented with minimal impact on already developed applications.

Positive consequences:

-   Increased overall performance of Markers, especially when using Marker Clusters.

Negative consequences:

-   No negative consequence found.

## Links

-   [ROU-12504](https://outsystemsrd.atlassian.net/browse/ROU-12504)


## Date

2026-02-10