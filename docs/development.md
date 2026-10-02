# Development and quality

## Stack and scope

The default client stack is Vite, TypeScript, React, Three.js, React Three Fiber, and Drei. Tooling includes ESLint, Prettier, Vitest, and React Testing Library when component behavior benefits from it. Keep Playwright to a few valuable smoke tests if it remains lightweight. Avoid extra state libraries until complexity warrants one.

The common framework and all thirteen scenes through the Observable Universe are implemented, together with the Galactic bulge sibling. The app includes a 13-level registry, fixed navigation, bilingual HUD, physical transitions, camera memory, static assets, and automated checks. The final scene includes a finite last-scattering-to-particle-horizon shell, precomputed joint T/E HEALPix temperature and Q/U polarization layers, a radial cosmology ruler, an incoming 3 Gpc transfer, and a reserved light-cone sector; detailed light-cone matter layers remain a future increment. See [implementation status and handoff](implementation-status.md) before continuing.

Live APIs, backend services, authentication, a universal 3D world, and automatic hierarchy playback remain out of scope. Continue the Observable Universe scientific layers incrementally.

User-requested GA4 tracking uses measurement ID `G-P4BVZ9ZZ0E`. The Google tag is installed once in the shared `index.html` head, covering all scenes and both languages. No custom analytics events are configured.

## Commands

Requires Node.js 22 or later. Run commands from the repository root.

```sh
npm install
npm run dev
npm run check
npm run build
```

`check` runs formatting verification, lint, type checking, and unit tests. CI runs a frozen install, the same checks, and the production build. Static hosting must work without a server-side router.

## Incremental scene workflow

Implement smaller to larger: Human, Earth, Earth and Moon, Sun, Earth–Sun, Solar System, Solar neighborhood, Galactic-center sibling, Milky Way, Local Group, Virgo, BAO, Cosmic Web, Observable Universe.

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

## Deploy to GitHub Pages

1. Open the repository's [Settings → Pages](https://github.com/d1ssk/olio-cosmic-scale/settings/pages) and select **GitHub Actions** under **Build and deployment → Source**.
2. Commit these changes and push them to `main`. The **Deploy to GitHub Pages** workflow runs the quality checks, builds the site, and publishes `dist`. Subsequent pushes to `main` update the site automatically. You can also run the workflow manually from the Actions tab on `main`.
3. After the deployment succeeds, open <https://d1ssk.github.io/olio-cosmic-scale/>.

The workflow uses the base path returned by GitHub Pages, including for custom domains. Runtime model and texture URLs use Vite's `import.meta.env.BASE_URL`. Local development keeps the default `/` base. See the [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages).

To preview the repository subpath locally:

```sh
npm run build -- --base=/olio-cosmic-scale/
npm run preview -- --base=/olio-cosmic-scale/
```

Open <http://localhost:4173/olio-cosmic-scale/> (or the port printed by Vite). Query-based deep links such as `?scene=solar-system&lang=ja` work without server-side routing or a custom 404 page.

## Documentation

The [documentation index](README.md) links the focused architecture, science, interaction, and scene guides. Use [implementation status](implementation-status.md) for current conventions and remaining work. The original specification remains in [the archive](archive/initial-project-spec.md).
