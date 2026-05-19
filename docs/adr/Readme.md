# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for this project.
ADRs are short documents that capture important architectural decisions, along with their context and consequences.

## Purpose

-   To document significant architectural decisions.
-   To provide context for why decisions were made.
-   To help onboard new team members.
-   To facilitate future architectural discussions and evolution.
-   To provide context to AI-powered development assistants.

## Format

Each ADR should follow the template in `ADR-0000-Title-of-ADR.md`.

## Process

1.  **Propose:** Copy `ADR-0000-Title-of-ADR.md` to a new file named `NNNN-title-of-adr.md`, where `NNNN` is the next sequential number and the rest is a dash-separated, lowercase version of the title.
2.  **Discuss:** Fill out the ADR and discuss it with the team.
3.  **Decide:** Once a decision is reached, update the status in the ADR (e.g., "Accepted", "Rejected", "Superseded").
4.  **Commit:** Commit the ADR to the repository.

## ADR Log

| ADR Number | Title                                                                                  | Status   | Date       |
| :--------- | :------------------------------------------------------------------------------------- | :------- | :--------- |
| [ADR-0000](./ADR-0000-Title-of-ADR.md) | Template for ADRs                                                          | Meta     | —          |
| [ADR-0001](./ADR-0001-Google-Markers-Draw-Performance.md) | Google Markers and Marker Cluster draw phase            | Accepted | 2026-02-10 |
| [ADR-0002](./ADR-0002-Replace-Google-DrawingManager-with-TerraDraw.md) | Replace Google DrawingManager with Terra Draw | Accepted | 2026-03-17 |
| [ADR-0003](./ADR-0003-Replace-Google-HeatmapLayer-with-deck-gl.md) | Replace Google HeatmapLayer with deck.gl HeatmapLayer | Accepted | 2026-04-07 |
| [ADR-0004](./ADR-0004-Fix-RespectUserZoom-Only-Breaking-Map-Center-Refresh.md) | Fix map center not refreshing when only respectUserZoom is active | Accepted | 2026-04-20 |
| [ADR-0005](./ADR-0005-Self-Contained-Bundling-of-NPM-Only-Runtime-Libraries.md) | Self-contained bundling of npm-only runtime libraries via external_libs folder | Proposed | 2026-05-19 |
| [ADR-0006](./ADR-0006-Replace-Google-KmlLayer-with-deck-gl-FileLayer.md) | Replace Google KmlLayer with deck.gl-based FileLayer | Proposed | 2026-05-19 |
