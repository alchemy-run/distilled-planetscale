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
│   ├── errors.ts           # ConfigError (Schema.TaggedError)
│   ├── credentials.ts      # PlanetScaleCredentials service + layer
│   ├── getOrganization.ts  # getOrganization effect with input/output schemas
│   └── listDatabases.ts    # listDatabases effect
├── tests/
│   ├── setup.ts            # Loads .env for tests
│   ├── getOrganization.test.ts
│   └── listDatabases.test.ts
├── specs/
│   ├── openapi.json              # PlanetScale OpenAPI spec (generated)
│   └── patch-getorganization.md  # Documents spec discrepancies
├── scripts/
│   └── setup.ts            # Fetches PlanetScale OpenAPI spec
└── index.ts                # Barrel file re-exporting src modules
```

## API Function Pattern

Each API function follows this pattern:

1. **Input Schema** (`Schema.Struct`) - Defines the input parameters
2. **Output Schema** (`Schema.Struct`) - Defines the response shape with runtime validation
3. **Errors** - Uses `@effect/platform` errors (`HttpClientError`, `ParseResult.ParseError`)
4. **Dependencies** - Requires `PlanetScaleCredentials` and `HttpClient.HttpClient`

Example:

```typescript
import { FetchHttpClient } from "@effect/platform";
import { Effect, Layer } from "effect";
import {
  getOrganization,
  PlanetScaleCredentials,
  PlanetScaleCredentialsLive,
} from "distilled-planetscale";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

const program = Effect.gen(function* () {
  const { organization } = yield* PlanetScaleCredentials;
  const org = yield* getOrganization({ name: organization });
  console.log(org);
}).pipe(Effect.provide(MainLayer));

Effect.runPromise(program);
```

## Tools

- **Runtime**: Bun
- **Type checking**: tsgo
- **Testing**: vitest + @effect/vitest
- **Framework**: Effect + @effect/platform
