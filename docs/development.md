# Development and quality

## Stack and scope

The default client stack is Vite, TypeScript, React, Three.js, React Three Fiber, and Drei. Tooling includes ESLint, Prettier, Vitest, and React Testing Library when component behavior benefits from it. Keep Playwright to a few valuable smoke tests if it remains lightweight. Avoid extra state libraries until complexity warrants one.

The common framework is implemented, along with Human (Hachikō), Earth, and Earth and Moon. It includes the 12-level registry, fixed navigation, compact logarithmic axis, bilingual HUD, physical depth-tested bars, sequential/manual bridges, direct Earth–Earth and Moon bar transfers, scene-local bar visibility, camera memory, static licensed assets, and automated checks. The remaining scenes use `PlaceholderScene`; their geometry is not scientific content. See [implementation status and handoff](implementation-status.md) before continuing.

Live APIs, backend services, authentication, analytics, large catalogs, a universal 3D world, and automatic hierarchy playback remain out of scope. Implement further scientific scenes incrementally; the next is Sun.

## Commands

```sh
npm install
npm run dev
npm run check
npm run build
```

`check` runs formatting verification, lint, type checking, and unit tests. CI runs a frozen install, the same checks, and the production build. Static hosting must work without a server-side router.

## Incremental scene workflow

Implement smaller to larger: Human, Earth, Earth and Moon, Sun, Earth–Sun, Solar System, Solar neighborhood, Galactic-center sibling, Milky Way, Local Group, Virgo, BAO, Observable Universe.

For each focused change:

1. settle the scientific definition of `referenceLength` and `viewportExtent`;
2. identify authoritative sources and coordinate frame;
3. classify every visual object as physical, marker, exaggerated, or density proxy;
4. implement data, transform, scene model, then rendering;
5. validate the incoming and outgoing bridges;
6. add parallel Japanese/English copy;
7. add logic and interaction tests;
8. verify desktop/mobile behavior and performance;
9. update the focused documentation and commit when requested.

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

## Asset preparation and cleanup

Runtime assets belong under `public/models/` with source/license documentation. The served Hachikō GLB is self-contained; normal development, tests and builds do not require its original downloads. Raw import files are temporary, excluded by `/tmp/`, and were removed after preparing the committed asset. To repeat preprocessing, obtain the documented lighter source GLB from its author and pass its local path to `scripts/prepare-hachiko.py`. Preserve the published GLB and attribution even when cleaning temporary inputs.

Browser QA during foundation development used an external temporary Playwright harness, not a committed browser-test dependency. Recreate the focused smoke checks described in the handoff when modifying scene transitions. `npm run check` remains the reproducible automated suite; `npm run build` currently emits a non-fatal large-chunk warning for the shared Three.js bundle.
