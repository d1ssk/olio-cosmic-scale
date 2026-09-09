# Development and quality

## Stack and scope

The default client stack is Vite, TypeScript, React, Three.js, React Three Fiber, and Drei. Tooling includes ESLint, Prettier, Vitest, and React Testing Library when component behavior benefits from it. Keep Playwright to a few valuable smoke tests if it remains lightweight. Avoid extra state libraries until complexity warrants one.

The initial scaffold implements shared infrastructure only: full-viewport shell, complete registry and graph, deep links, bilingual state, camera-memory interface, SI length utilities/formatter, responsive bridge planner and renderer with overrides, normalized coordinates, common R3F host with both projections and reset, development placeholders, tests, and CI.

It explicitly excludes full scientific scenes and catalogs, a polished human model, large datasets, decorative invented science, continuous zoom, universal astronomical coordinates, backend services, databases, authentication, analytics, and unnecessary external APIs.

## Commands

```sh
npm install
npm run dev
npm run check
npm run build
```

`check` runs formatting verification, lint, type checking, and unit tests. CI runs a frozen install, the same checks, and the production build. Static hosting must work without a server-side router.

## Incremental scene workflow

Implement smaller to larger: Human, Earth, Sun, Earth–Sun, Solar System, Solar neighborhood, Galactic-center sibling, Milky Way, Local Group, Virgo, BAO, Observable Universe.

For each focused change:

1. settle the scientific definition of `referenceLength` and `viewportExtent`;
2. identify authoritative sources and coordinate frame;
3. classify every visual object as physical, marker, exaggerated, or density proxy;
4. implement data, transform, scene model, then rendering;
5. validate the incoming and outgoing bridges;
6. add parallel Japanese/English copy;
7. add logic and interaction tests;
8. verify desktop/mobile behavior and performance;
9. commit as one reviewable hierarchy-level change.

Do not batch major levels unless explicitly requested. Surface a genuinely unresolved scientific or UX choice in the handoff instead of silently selecting a convention.

## Testing priorities

Highest priority is logic whose regression silently changes scientific meaning:

- conversion and precision-aware formatting;
- bridge milestones, responsive legibility, and reverse symmetry;
- graph order, lateral navigation, URL parsing, and language selection;
- normalized coordinate transforms and camera reset/persistence;
- later, scene-specific coordinates, representation metadata, and source bindings.

Use visual snapshots sparingly. For important 3D scenes, a smoke test can check canvas startup, controls, navigation, and absence of runtime errors.

## Code and review rules

- Keep scientific values centralized and sourced; do not duplicate equivalent units.
- Keep rendering independent from data and coordinate transforms.
- Reuse common shell, host, controls, HUD, bridges, and translations.
- Use seeded random generation and explicit density rules.
- Prefer source-backed, testable clarity over cinematic decoration.
- Run `npm run check` and `npm run build` before handoff.

The guiding review question is: does this improve accurate intuition for the physical scale and its ratio to neighboring scales? If not, it is secondary.
