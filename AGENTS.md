# Cosmic Scale Explorer — agent guide

## Project-wide invariants

- This is a sequence of independent, physically grounded scale scenes joined by explicit DOM/SVG scale bridges; it is never one universal 3D world. The user-authorized exception is `earth-sun` ↔ `solar-system`: these share one physical world and continuous camera zoom; other scenes stay independent.
- Store canonical lengths in SI meters, normalize render coordinates per scene, centralize scientific values, record provenance, and label every marker, exaggeration, density proxy, model, and adopted convention honestly.
- Keep `referenceLength` distinct from `viewportExtent`. Hierarchy changes require explicit controls except for the user-authorized automatic Earth–Sun / Solar System labels within their shared world; zoom never exits that world.
- Japanese and English are supported from the start. Shared user-facing prose must use translation keys.
- The main hierarchy has 12 levels, including Earth and Moon between Earth and Sun. The Galactic-center neighborhood is a same-scale sibling of the Solar neighborhood, not a thirteenth level.
- Keep the app static-first, responsive, accessible, reduced-motion aware, deterministic where sampled, and usable on modern desktop and mobile hardware.

## Documentation map

- [Implementation status and continuation](docs/implementation-status.md)

- [Product and interaction](docs/product-and-interaction.md)
- [Architecture and state](docs/architecture.md)
- [Scales, units, and bridges](docs/scales-and-bridges.md)
- [Scientific data and rendering](docs/scientific-guidelines.md)
- [Internationalization, accessibility, and visual design](docs/experience-guidelines.md)
- [Scene specifications](docs/scenes.md)
- [Development and quality](docs/development.md)
- [Archived initial specification](docs/archive/initial-project-spec.md) — historical source, preserved verbatim

Read only the focused documents relevant to a change. Read `docs/scenes.md` plus the scientific and scale guidelines before implementing a scientific scene.

## Development rules

- Implement scenes incrementally from smaller to larger scales; do not batch major hierarchy levels without an explicit request.
- Separate scientific data → coordinate transform → scene model → render representation. Do not put scientific constants or datasets in rendering components.
- Reuse the common scene host, HUD, navigation graph, bridge planner, camera-state store, unit formatter, and i18n layer.
- Add targeted tests for logic that can silently distort scientific meaning. Before handoff, run `npm run check` and `npm run build`.
- Do not add live APIs, a backend, authentication, analytics, large datasets, or speculative systems unless requested.
- If a convention is ambiguous, document the adopted definition and update metadata, UI copy, tests, and sources together.
