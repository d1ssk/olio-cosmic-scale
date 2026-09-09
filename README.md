# Cosmic Scale Explorer

An interactive, bilingual visualization for learning physical and astronomical length scales as discrete scenes connected by explicit length-comparison bridges.

The repository currently contains the common application infrastructure and development placeholders for all planned scenes. Scientific scenes will be implemented incrementally from Human to the Observable Universe.

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

## Project documentation

Start with [docs/README.md](docs/README.md). The concise [AGENTS.md](AGENTS.md) keeps project-wide invariants in context; detailed scene, scientific, bridge, experience, architecture, and development guidance lives under `docs/`.

The original specification is preserved verbatim at [docs/archive/initial-project-spec.md](docs/archive/initial-project-spec.md).
