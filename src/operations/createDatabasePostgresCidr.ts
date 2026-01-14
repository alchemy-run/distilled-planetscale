import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const CreateDatabasePostgresCidrInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  schema: Schema.optional(Schema.String),
  role: Schema.optional(Schema.String),
  cidrs: Schema.Array(Schema.String),
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string }) => `/organizations/${input.organization}/databases/${input.database}/cidrs`,
  [ApiPathParams]: ["organization", "database"] as const,
});
export type CreateDatabasePostgresCidrInput = typeof CreateDatabasePostgresCidrInput.Type;

// Output Schema
export const CreateDatabasePostgresCidrOutput = Schema.Struct({
  id: Schema.String,
  schema: Schema.String,
  role: Schema.String,
  cidrs: Schema.Array(Schema.String),
  created_at: Schema.String,
  updated_at: Schema.String,
  deleted_at: Schema.String,
  actor: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
});
export type CreateDatabasePostgresCidrOutput = typeof CreateDatabasePostgresCidrOutput.Type;

// Error Schemas
export class CreateDatabasePostgresCidrUnauthorized extends Schema.TaggedError<CreateDatabasePostgresCidrUnauthorized>()(
  "CreateDatabasePostgresCidrUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class CreateDatabasePostgresCidrForbidden extends Schema.TaggedError<CreateDatabasePostgresCidrForbidden>()(
  "CreateDatabasePostgresCidrForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class CreateDatabasePostgresCidrNotfound extends Schema.TaggedError<CreateDatabasePostgresCidrNotfound>()(
  "CreateDatabasePostgresCidrNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class CreateDatabasePostgresCidrUnprocessableentity extends Schema.TaggedError<CreateDatabasePostgresCidrUnprocessableentity>()(
  "CreateDatabasePostgresCidrUnprocessableentity",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
).pipe(Category.withBadRequestError) {}

export class CreateDatabasePostgresCidrInternalservererror extends Schema.TaggedError<CreateDatabasePostgresCidrInternalservererror>()(
  "CreateDatabasePostgresCidrInternalservererror",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Create an IP restriction entry
 *
 * @param organization - The name of the organization the database belongs to
 * @param database - The name of the database
 * @param schema - The PostgreSQL schema to restrict access to. Leave empty or omit to allow access to all schemas.
 * @param role - The PostgreSQL role to restrict access to. Leave empty or omit to allow access for all roles.
 * @param cidrs - List of IPv4 CIDR ranges (e.g., ['192.168.1.0/24', '192.168.1.1/32']). Must contain at least one valid IPv4 address or range.
 */
export const createDatabasePostgresCidr = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateDatabasePostgresCidrInput,
  outputSchema: CreateDatabasePostgresCidrOutput,
  errors: [CreateDatabasePostgresCidrUnauthorized, CreateDatabasePostgresCidrForbidden, CreateDatabasePostgresCidrNotfound, CreateDatabasePostgresCidrUnprocessableentity, CreateDatabasePostgresCidrInternalservererror],
}));
