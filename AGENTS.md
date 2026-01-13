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

| Script                                   | Description                                          |
| ---------------------------------------- | ---------------------------------------------------- |
| `bun run setup`                          | Fetch the latest PlanetScale OpenAPI spec            |
| `bun run generate`                       | Generate operations from OpenAPI spec using Claude   |
| `bun run typecheck`                      | Type check with tsgo                                 |
| `bunx vitest run`                        | Run tests                                            |
| `bun run scripts/write-tests.ts`         | Auto-generate tests for unchecked operations         |

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
│   └── *.patch.json              # JSON Patch files for spec fixes
├── scripts/
│   ├── setup.ts            # Fetches PlanetScale OpenAPI spec
│   ├── generate-operations.ts  # Generates operations using Claude AI
│   └── write-tests.ts      # Auto-generates tests using opencode
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

## Test Generation

The `write-tests.ts` script uses opencode to automatically generate tests for operations listed in `todo-tests.md`:

```bash
# Generate tests for all unchecked operations
bun run scripts/write-tests.ts

# Generate tests for a limited number of operations
bun run scripts/write-tests.ts --limit 5
bun run scripts/write-tests.ts -l 1
```

### How it works

1. Reads `todo-tests.md` and extracts all unchecked operations (lines matching `- [ ] operationName`)
2. For each operation, spawns an opencode instance (using `claude-opus-4-5`) with a prompt to write a test
3. After opencode completes, marks the operation as complete in `todo-tests.md` (changes `- [ ]` to `- [x]`)
4. Commits the changes with message `chore(tests): test for <operation-name>`
5. Repeats for the next operation

The script processes operations sequentially (one at a time) and logs progress with clear separators between each operation.

## Testing Guidelines

- **Resource cleanup**: Tests must always clean up any resources they create (databases, branches, passwords, etc.). Use `Effect.ensuring` or cleanup in a finally block to guarantee cleanup runs even if the test fails.
- **Unique names**: Use timestamps or random suffixes for resource names to avoid conflicts between test runs.

### Test Structure

Each operation test file should include:

1. **Schema validation tests** - Verify input/output schemas have expected fields
2. **Success tests** - Test the happy path (for GET operations that don't modify state)
3. **Error handling tests** - Test that typed errors are returned correctly

### Test File Template

```typescript
import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  operationName,
  OperationNameNotfound,
  OperationNameInput,
  OperationNameOutput,
} from "../src/operations/operationName";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("operationName", () => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(OperationNameInput.fields.organization).toBeDefined();
    // ... verify other required fields
  });

  it("should have the correct output schema", () => {
    expect(OperationNameOutput.fields.id).toBeDefined();
    // ... verify other expected fields
  });

  // Success test (for read-only operations)
  it.effect("should fetch data successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* operationName({ organization, /* ... */ }).pipe(
        // Handle case where test resource doesn't exist
        Effect.catchTag("OperationNameNotfound", () =>
          Effect.succeed({ /* fallback shape */ }),
        ),
      );
      expect(result).toHaveProperty("expectedField");
    }).pipe(Effect.provide(MainLayer)),
  );

  // Error handling tests
  it.effect("should return OperationNameNotfound for non-existent resource", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* operationName({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(OperationNameNotfound);
      if (result instanceof OperationNameNotfound) {
        expect(result._tag).toBe("OperationNameNotfound");
        expect(result.organization).toBe(organization);
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
```

### Resource Cleanup Pattern

For operations that create resources, use `Effect.ensuring` to guarantee cleanup:

```typescript
it.effect("should create resource successfully", () =>
  Effect.gen(function* () {
    const { organization } = yield* PlanetScaleCredentials;
    const resourceName = `test-resource-${Date.now()}`;

    const result = yield* createResource({
      organization,
      name: resourceName,
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name", resourceName);
  }).pipe(
    Effect.ensuring(
      Effect.gen(function* () {
        const { organization } = yield* PlanetScaleCredentials;
        yield* deleteResource({
          organization,
          name: resourceName,
        }).pipe(Effect.ignore);
      }),
    ),
    Effect.provide(MainLayer),
  ),
);
```

### Best Practices

- **Use `Effect.ignore`** for cleanup operations that may fail (resource already deleted, etc.)
- **Use `Effect.catchTag`** to handle expected errors gracefully in success tests
- **Use `Effect.matchEffect`** to capture errors for assertion in error tests
- **Test both non-existent resources AND non-existent organizations** for not_found errors
- **Verify error properties** like `_tag`, `organization`, `database`, etc.
- **Import `./setup`** to load environment variables from `.env`

## Schema Patching

When the OpenAPI spec has discrepancies with the actual API behavior, use JSON Patch files to fix the spec during generation.

### Patch File Format

Patches use the [JSON Patch (RFC 6902)](https://tools.ietf.org/html/rfc6902) format. Create a `.patch.json` file in the `specs/` directory:

```json
{
  "description": "Brief description of what this patch fixes",
  "patches": [
    {
      "op": "replace",
      "path": "/definitions/SomeSchema/properties/field/type",
      "value": "string"
    },
    {
      "op": "add",
      "path": "/definitions/SomeSchema/properties/field/x-nullable",
      "value": true
    },
    {
      "op": "remove",
      "path": "/definitions/SomeSchema/required/2"
    }
  ]
}
```

### Supported Operations

| Operation | Description |
|-----------|-------------|
| `add` | Add a new property or array element |
| `remove` | Remove a property or array element |
| `replace` | Replace an existing value |
| `move` | Move a value from one location to another |
| `copy` | Copy a value to a new location |
| `test` | Test that a value matches (fails if not) |

### Common Patches

**Make a field optional** (remove from required array):
```json
{
  "op": "replace",
  "path": "/definitions/Schema/required",
  "value": ["field1", "field2"]
}
```

**Make a field nullable** (add x-nullable extension):
```json
{
  "op": "add",
  "path": "/definitions/Schema/properties/fieldName/x-nullable",
  "value": true
}
```

**Change a field type**:
```json
{
  "op": "replace",
  "path": "/definitions/Schema/properties/fieldName/type",
  "value": "string"
}
```

### Applying Patches

Patches are automatically applied when running `bun run generate`. You can also test patches standalone:

```bash
bun run scripts/apply-patches.ts
```

### JSON Pointer Syntax

Paths use [JSON Pointer (RFC 6901)](https://tools.ietf.org/html/rfc6901) syntax:
- `/` separates path segments
- `~0` escapes `~` characters
- `~1` escapes `/` characters
- Array indices are numbers (e.g., `/required/0`)
- `-` refers to the end of an array (for `add` operations)

Example paths:
- `/definitions/Organization/required` - the required array
- `/definitions/Organization/properties/name/type` - a property's type
- `/paths/~1organizations~1{organization}/get/responses/200` - a response (note `~1` escapes `/`)

## Tools

- **Runtime**: Bun
- **Type checking**: tsgo
- **Testing**: vitest + @effect/vitest
- **Framework**: Effect + @effect/platform
