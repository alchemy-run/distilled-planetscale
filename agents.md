# distilled-planetscale

An Effect-based TypeScript client for the PlanetScale API.

## Setup

```bash
bun install
```

Create a `.env` file with your PlanetScale credentials:

```
PLANETSCALE_API_TOKEN=<SERVICE_TOKEN_ID>:<SERVICE_TOKEN>
PLANETSCALE_ORGANIZATION=<your-org-name>
```

## Scripts

| Script | Description |
|--------|-------------|
| `bun run setup` | Fetch the latest PlanetScale OpenAPI spec |
| `bun run typecheck` | Type check with tsgo |
| `bunx vitest run` | Run tests |

## Project Structure

```
├── src/
│   ├── errors.ts           # PlanetScaleError, ConfigError (Schema.TaggedError)
│   ├── credentials.ts      # PlanetScaleCredentials service + layer
│   ├── getOrganization.ts  # getOrganization effect
│   └── listDatabases.ts    # listDatabases effect
├── tests/
│   ├── setup.ts            # Loads .env for tests
│   ├── getOrganization.test.ts
│   └── listDatabases.test.ts
├── specs/
│   └── openapi.json        # PlanetScale OpenAPI spec (generated)
├── scripts/
│   └── setup.ts            # Fetches PlanetScale OpenAPI spec
└── index.ts                # Barrel file re-exporting src modules
```

## Usage

```typescript
import { Effect } from "effect";
import {
  getOrganization,
  listDatabases,
  PlanetScaleCredentialsLive,
} from "distilled-planetscale";

const program = Effect.gen(function* () {
  const org = yield* getOrganization;
  console.log(org);

  const databases = yield* listDatabases;
  console.log(databases);
}).pipe(Effect.provide(PlanetScaleCredentialsLive));

Effect.runPromise(program);
```

## Tools

- **Runtime**: Bun
- **Type checking**: tsgo
- **Testing**: vitest + @effect/vitest
- **Framework**: Effect
