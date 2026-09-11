# Cosmic Scale Explorer

An interactive, bilingual visualization for learning physical and astronomical length scales as discrete scenes connected by explicit length-comparison bridges.

The common application framework and the first twelve levels—from Human (Hachikō) through the AbacusSummit Cosmic Web—are implemented. The 13-level hierarchy ends with an Observable Universe development placeholder. See the [implementation handoff](docs/implementation-status.md) for current conventions.

## Run locally

Requires Node.js 22 or later.

```sh
npm install
npm run dev
```

Open the URL printed by Vite. Deep links use query parameters, for example:

```text
?scene=solar-neighborhood&lang=en
```

## Quality checks

```sh
npm run check
npm run build
```

`check` verifies formatting, lint, TypeScript, and unit tests. CI runs both commands for pushes and pull requests.

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

## Project documentation

Start with [docs/README.md](docs/README.md). The concise [AGENTS.md](AGENTS.md) keeps project-wide invariants in context; detailed scene, scientific, bridge, experience, architecture, and development guidance lives under `docs/`.

The original specification is preserved verbatim at [docs/archive/initial-project-spec.md](docs/archive/initial-project-spec.md).
