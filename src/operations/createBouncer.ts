import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const CreateBouncerInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  name: Schema.optional(Schema.String),
  target: Schema.optional(Schema.String),
  bouncer_size: Schema.optional(Schema.String),
  replicas_per_cell: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/bouncers`,
  [ApiPathParams]: ["organization", "database", "branch"] as const,
});
export type CreateBouncerInput = typeof CreateBouncerInput.Type;

// Output Schema
export const CreateBouncerOutput = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  sku: Schema.Struct({
    name: Schema.String,
    display_name: Schema.String,
    cpu: Schema.String,
    ram: Schema.Number,
    sort_order: Schema.Number,
  }),
  target: Schema.Literal("primary", "replica", "replica_az_affinity"),
  replicas_per_cell: Schema.Number,
  created_at: Schema.String,
  updated_at: Schema.String,
  deleted_at: Schema.String,
  actor: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
  branch: Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    deleted_at: Schema.String,
  }),
  parameters: Schema.Array(Schema.Struct({
    id: Schema.String,
    namespace: Schema.Literal("pgbouncer"),
    name: Schema.String,
    display_name: Schema.String,
    category: Schema.String,
    description: Schema.String,
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
});
export type CreateBouncerOutput = typeof CreateBouncerOutput.Type;

// Error Schemas
export class CreateBouncerUnauthorized extends Schema.TaggedError<CreateBouncerUnauthorized>()(
  "CreateBouncerUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class CreateBouncerForbidden extends Schema.TaggedError<CreateBouncerForbidden>()(
  "CreateBouncerForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class CreateBouncerNotfound extends Schema.TaggedError<CreateBouncerNotfound>()(
  "CreateBouncerNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class CreateBouncerInternalservererror extends Schema.TaggedError<CreateBouncerInternalservererror>()(
  "CreateBouncerInternalservererror",
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
 * Create a bouncer
 *
 * @param organization - The name of the organization that owns this resource
 * @param database - The name of the database that owns this resource
 * @param branch - The name of the branch that owns this resource
 * @param name - The bouncer name
 * @param target - The type of server the bouncer targets
 * @param bouncer_size - The size SKU for the bouncer
 * @param replicas_per_cell - The number of replica servers per cell
 */
export const createBouncer = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateBouncerInput,
  outputSchema: CreateBouncerOutput,
  errors: [CreateBouncerUnauthorized, CreateBouncerForbidden, CreateBouncerNotfound, CreateBouncerInternalservererror],
}));
