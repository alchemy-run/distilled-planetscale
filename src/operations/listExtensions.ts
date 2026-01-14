import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const ListExtensionsInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/extensions`,
  [ApiPathParams]: ["organization", "database", "branch"] as const,
});
export type ListExtensionsInput = typeof ListExtensionsInput.Type;

// Output Schema
export const ListExtensionsOutput = Schema.Array(Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  description: Schema.String,
  internal: Schema.Boolean,
  url: Schema.String,
  parameters: Schema.Array(Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    display_name: Schema.String,
    namespace: Schema.Literal("patroni", "pgconf", "pgbouncer"),
    category: Schema.String,
    description: Schema.String,
    extension: Schema.Boolean,
    internal: Schema.Boolean,
    parameter_type: Schema.Literal("array", "boolean", "bytes", "float", "integer", "internal", "seconds", "select", "string", "time"),
    default_value: Schema.String,
    value: Schema.String,
    required: Schema.Boolean,
    created_at: Schema.String,
    updated_at: Schema.String,
    restart: Schema.Boolean,
    max: Schema.Number,
    min: Schema.Number,
    step: Schema.Number,
    url: Schema.String,
    options: Schema.Array(Schema.String),
    actor: Schema.Struct({
      id: Schema.String,
      display_name: Schema.String,
      avatar_url: Schema.String,
    }),
  })),
}));
export type ListExtensionsOutput = typeof ListExtensionsOutput.Type;

// Error Schemas
export class ListExtensionsUnauthorized extends Schema.TaggedError<ListExtensionsUnauthorized>()(
  "ListExtensionsUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class ListExtensionsForbidden extends Schema.TaggedError<ListExtensionsForbidden>()(
  "ListExtensionsForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class ListExtensionsNotfound extends Schema.TaggedError<ListExtensionsNotfound>()(
  "ListExtensionsNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class ListExtensionsInternalservererror extends Schema.TaggedError<ListExtensionsInternalservererror>()(
  "ListExtensionsInternalservererror",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * List cluster extensions
 *
 * @param organization - The name of the organization that owns this resource
 * @param database - The name of the database that owns this resource
 * @param branch - The name of the branch that owns this resource
 */
export const listExtensions = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListExtensionsInput,
  outputSchema: ListExtensionsOutput,
  errors: [ListExtensionsUnauthorized, ListExtensionsForbidden, ListExtensionsNotfound, ListExtensionsInternalservererror],
}));
