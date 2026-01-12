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

| Script              | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `bun run setup`     | Fetch the latest PlanetScale OpenAPI spec            |
| `bun run generate`  | Generate operations from OpenAPI spec using Claude   |
| `bun run typecheck` | Type check with tsgo                                 |
| `bunx vitest run`   | Run tests                                          |

## Project Structure

```
├── src/
│   ├── client.ts           # makeOperation factory + shared error types
│   ├── errors.ts           # ConfigError (Schema.TaggedError)
│   ├── credentials.ts      # PlanetScaleCredentials service + layer
│   └── operations          # All Operations
│       ├── getOrganization.ts  # getOrganization operation
│       └── listDatabases.ts    # listDatabases effect
├── tests/
│   ├── setup.ts            # Loads .env for tests
│   ├── getOrganization.test.ts
│   └── listDatabases.test.ts
├── specs/
│   ├── openapi.json              # PlanetScale OpenAPI spec (generated)
│   └── patch-getorganization.md  # Documents spec discrepancies
├── scripts/
│   ├── setup.ts            # Fetches PlanetScale OpenAPI spec
│   └── generate-operations.ts  # Generates operations using Claude AI
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

## Operation Generation

The `generate` script uses the Claude CLI to automatically generate operations from the OpenAPI spec:

```bash
# Ensure the Claude CLI is installed and authenticated
bun run generate
```

The generator:
1. Uses Claude Haiku (via CLI) to analyze the OpenAPI spec and discover all operations
2. Compares against existing operations and tests in `src/operations/` and `tests/`
3. Uses Claude Opus (via CLI) to generate missing operations and tests
4. Runs tests after generation - if tests fail, the generated files are cleaned up
5. Updates `index.ts` with new exports

## Testing Guidelines

- **Resource cleanup**: Tests must always clean up any resources they create (databases, branches, passwords, etc.). Use `Effect.ensuring` or cleanup in a finally block to guarantee cleanup runs even if the test fails.
- **Unique names**: Use timestamps or random suffixes for resource names to avoid conflicts between test runs.

## Tools

- **Runtime**: Bun
- **Type checking**: tsgo
- **Testing**: vitest + @effect/vitest
- **Framework**: Effect + @effect/platform
