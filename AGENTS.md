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
│   ├── client.ts           # API.make/makePaginated factory + shared error types
│   ├── pagination.ts       # paginatePages/paginateItems stream utilities
│   ├── errors.ts           # ConfigError (Schema.TaggedError)
│   ├── credentials.ts      # PlanetScaleCredentials service + layer
│   └── operations          # All Operations
│       ├── getOrganization.ts  # getOrganization operation
│       └── listDatabases.ts    # listDatabases effect
├── tests/
│   ├── setup.ts            # Loads .env, exports withMainLayer for tests
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

Operations are defined declaratively using `API.make`:

```typescript
import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "./client";
import * as Category from "./category";

// Input Schema
export const GetOrganizationInput = Schema.Struct({
  organization: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}`,
  [ApiPathParams]: ["organization"] as const,
});

// Output Schema
export const GetOrganizationOutput = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  // ... other fields
});

// Error with ApiErrorCode annotation AND Category decorator
export class GetOrganizationNotfound extends Schema.TaggedError<GetOrganizationNotfound>()(
  "GetOrganizationNotfound",
  { organization: Schema.String, message: Schema.String },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

// Define the operation
export const getOrganization = API.make(() => ({
  inputSchema: GetOrganizationInput,
  outputSchema: GetOrganizationOutput,
  errors: [GetOrganizationNotfound],
}));
```

### Error Code to Category Mapping

When generating operations, use the following mapping from API error codes to categories:

| Error Code | Category | Decorator |
|------------|----------|-----------|
| `unauthorized` | `AuthError` | `Category.withAuthError` |
| `forbidden` | `AuthError` | `Category.withAuthError` |
| `not_found` | `NotFoundError` | `Category.withNotFoundError` |
| `conflict` | `ConflictError` | `Category.withConflictError` |
| `unprocessable_entity` | `BadRequestError` | `Category.withBadRequestError` |
| `bad_request` | `BadRequestError` | `Category.withBadRequestError` |
| `too_many_requests` | `ThrottlingError` | `Category.withThrottlingError` |
| `internal_server_error` | `ServerError` | `Category.withServerError` |
| `service_unavailable` | `ServerError` | `Category.withServerError` |

This mapping is also documented in `specs/error-categories.patch.json`.

## Error Handling

- **Annotated errors** - Use `ApiErrorCode` symbol to map error classes to API error codes
- **`PlanetScaleApiError`** - Generic fallback for unhandled API error codes (body: unknown)
- **`PlanetScaleParseError`** - Schema validation failures (body + cause)
- **`HttpClientError`** - Network/connection errors from @effect/platform

## Error Categories

Errors can be annotated with categories for semantic grouping and handling. Categories are defined in `src/category.ts` and allow you to catch errors by type rather than specific class.

### Available Categories

| Category | Description | Built-in Errors |
|----------|-------------|-----------------|
| `AuthError` | Authentication/authorization failures (401, 403) | - |
| `BadRequestError` | Invalid request parameters (400) | - |
| `ConflictError` | Resource conflicts (409) | - |
| `NotFoundError` | Resource not found (404) | - |
| `QuotaError` | Quota/limit exceeded | - |
| `ServerError` | Server-side errors (5xx) | `PlanetScaleApiError`, `PlanetScaleError` |
| `ThrottlingError` | Rate limiting (429) | - |
| `NetworkError` | Connection/network failures | - |
| `ParseError` | Response parsing failures | `PlanetScaleParseError` |
| `ConfigurationError` | Missing configuration | `ConfigError` |

### Adding Categories to Errors

Use `withCategory` or convenience decorators with `.pipe()`:

```typescript
import { Schema } from "effect";
import * as Category from "./category";
import { ApiErrorCode } from "./client";

export class GetOrganizationNotfound extends Schema.TaggedError<GetOrganizationNotfound>()(
  "GetOrganizationNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

// Multiple categories
export class RateLimitError extends Schema.TaggedError<RateLimitError>()(
  "RateLimitError",
  { retryAfter: Schema.Number },
).pipe(Category.withCategory(Category.ThrottlingError, Category.ServerError)) {}
```

### Catching Errors by Category

```typescript
import { Effect } from "effect";
import { Category } from "distilled-planetscale";

// Catch a single category
const program = getOrganization({ organization: "test" }).pipe(
  Category.catchNotFoundError((err) =>
    Effect.succeed({ fallback: true })
  ),
);

// Catch multiple categories
const program2 = getOrganization({ organization: "test" }).pipe(
  Category.catchErrors(
    Category.NotFoundError,
    Category.AuthError,
    (err) => Effect.succeed({ fallback: true })
  ),
);
```

### Category Predicates

Use predicates for retry logic or conditional handling:

```typescript
import { Category } from "distilled-planetscale";

// Individual predicates
Category.isAuthError(error);       // true if has AuthError category
Category.isNotFoundError(error);   // true if has NotFoundError category
Category.isServerError(error);     // true if has ServerError category

// Transient errors (good for retry logic)
Category.isTransientError(error);  // true if ThrottlingError | ServerError | NetworkError

// Use with Effect.retry
const program = myOperation().pipe(
  Effect.retry({
    times: 3,
    while: Category.isTransientError,
  }),
);
```

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

## Pagination

Paginated operations can be consumed as Effect Streams using the `paginatePages` and `paginateItems` utilities, or by using `API.makePaginated` to create operations with built-in `.pages()` and `.items()` methods.

### Using paginatePages / paginateItems

```typescript
import { Effect, Stream } from "effect";
import { listDatabases, paginatePages, paginateItems } from "distilled-planetscale";

// Stream all pages (full response objects)
const allPages = paginatePages(listDatabases, { organization: "my-org" });

// Stream individual items
const allDatabases = paginateItems(listDatabases, { organization: "my-org" });

// Consume the stream
const program = allDatabases.pipe(
  Stream.tap((db) => Effect.log(`Database: ${db.name}`)),
  Stream.runDrain,
);
```

### Using API.makePaginated

Operations created with `API.makePaginated` have `.pages()` and `.items()` methods attached:

```typescript
import { Schema } from "effect";
import { API, ApiMethod, ApiPath, ApiPathParams } from "distilled-planetscale";

// Define input/output schemas
const ListDatabasesInput = Schema.Struct({
  organization: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input) => `/organizations/${input.organization}/databases`,
  [ApiPathParams]: ["organization"] as const,
});

const ListDatabasesOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.NullOr(Schema.Number),
  next_page_url: Schema.NullOr(Schema.String),
  prev_page: Schema.NullOr(Schema.Number),
  prev_page_url: Schema.NullOr(Schema.String),
  data: Schema.Array(DatabaseSchema),
});

// Create paginated operation
const listDatabases = API.makePaginated(() => ({
  inputSchema: ListDatabasesInput,
  outputSchema: ListDatabasesOutput,
  errors: [ListDatabasesNotfound],
}));

// Usage:
// Single page
const page1 = listDatabases({ organization: "my-org" });

// Stream all pages
const allPages = listDatabases.pages({ organization: "my-org" });

// Stream all items
const allDatabases = listDatabases.items({ organization: "my-org" });
```

### Pagination Trait

PlanetScale uses page-based pagination with the following structure:

| Field | Type | Description |
|-------|------|-------------|
| `page` (input) | number | 1-indexed page number |
| `per_page` (input) | number | Number of items per page |
| `current_page` (output) | number | Current page number |
| `next_page` (output) | number \| null | Next page number, or null if no more pages |
| `data` (output) | array | Array of items for the current page |

The default pagination trait is:

```typescript
const DefaultPaginationTrait = {
  inputToken: "page",
  outputToken: "next_page",
  items: "data",
  pageSize: "per_page",
};
```

Custom pagination traits can be passed to `paginatePages`/`paginateItems` or configured in `API.makePaginated`.

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

Tests use the `withMainLayer` helper from `./setup` which automatically provides `PlanetScaleCredentials` and `FetchHttpClient` to all `it.effect` tests:

```typescript
import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  operationName,
  OperationNameNotfound,
  OperationNameInput,
  OperationNameOutput,
} from "../src/operations/operationName";
import { withMainLayer } from "./setup";

withMainLayer("operationName", (it) => {
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
    }),
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
    }),
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
- **Use `withMainLayer`** wrapper to automatically provide layer to all tests

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
