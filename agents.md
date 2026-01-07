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

| Script              | Description                               |
| ------------------- | ----------------------------------------- |
| `bun run setup`     | Fetch the latest PlanetScale OpenAPI spec |
| `bun run typecheck` | Type check with tsgo                      |
| `bunx vitest run`   | Run tests                                 |

## Project Structure

```
├── src/
│   ├── client.ts           # makeOperation factory + shared error types
│   ├── errors.ts           # ConfigError (Schema.TaggedError)
│   ├── credentials.ts      # PlanetScaleCredentials service + layer
│   ├── getOrganization.ts  # getOrganization operation
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

## API Operation Pattern

Operations are defined declaratively using `makeOperation`:

```typescript
import { Schema } from "effect";
import { ApiErrorCode, makeOperation } from "./client";

// Input Schema
export const GetOrganizationInput = Schema.Struct({
  name: Schema.String,
});

// Output Schema
export const Organization = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  // ... other fields
});

// Error with ApiErrorCode annotation (maps to API response "code" field)
export class OrganizationNotFound extends Schema.TaggedError<OrganizationNotFound>()(
  "OrganizationNotFound",
  { name: Schema.String, message: Schema.String },
  { [ApiErrorCode]: "not_found" },
) {}

// Define the operation
export const getOrganization = makeOperation({
  method: "GET",
  path: (input) => `/organizations/${input.name}`,
  inputSchema: GetOrganizationInput,
  outputSchema: Organization,
  errors: [OrganizationNotFound],
});
```

## Error Handling

- **Annotated errors** - Use `ApiErrorCode` symbol to map error classes to API error codes
- **`PlanetScaleApiError`** - Generic fallback for unhandled API error codes (body: unknown)
- **`PlanetScaleParseError`** - Schema validation failures (body + cause)
- **`HttpClientError`** - Network/connection errors from @effect/platform

## Usage

```typescript
import { FetchHttpClient } from "@effect/platform";
import { Effect, Layer } from "effect";
import {
  getOrganization,
  OrganizationNotFound,
  PlanetScaleCredentials,
  PlanetScaleCredentialsLive,
} from "distilled-planetscale";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

const program = Effect.gen(function* () {
  const { organization } = yield* PlanetScaleCredentials;
  const org = yield* getOrganization({ name: organization });
  console.log(org);
}).pipe(
  Effect.catchTag("OrganizationNotFound", (e) =>
    Effect.log(`Organization ${e.name} not found: ${e.message}`),
  ),
  Effect.provide(MainLayer),
);

Effect.runPromise(program);
```

## Tools

- **Runtime**: Bun
- **Type checking**: tsgo
- **Testing**: vitest + @effect/vitest
- **Framework**: Effect + @effect/platform
