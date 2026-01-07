# distilled-planetscale

A TypeScript project for working with the PlanetScale API.

## Setup

```bash
bun install
bun run setup
```

The setup script fetches the latest PlanetScale OpenAPI spec and saves it to `specs/openapi.json`.

## Scripts

| Script | Description |
|--------|-------------|
| `bun run setup` | Fetch the latest PlanetScale OpenAPI spec |
| `bun run typecheck` | Type check with tsgo (TypeScript-Go) |
| `bun run lint` | Lint with oxlint |
| `bun run format` | Format with oxfmt |
| `bun run format:check` | Check formatting |

## Project Structure

```
├── scripts/
│   └── setup.ts      # Fetches PlanetScale OpenAPI spec
├── specs/
│   └── openapi.json  # PlanetScale OpenAPI spec (generated)
└── index.ts          # Entry point
```

## Tools

- **Runtime**: Bun
- **Type checking**: tsgo (TypeScript-Go)
- **Linting**: oxlint
- **Formatting**: oxfmt
