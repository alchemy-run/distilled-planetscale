import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";
import * as Category from "../category";

// Input Schema
export const UpdateDatabasePostgresCidrInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  id: Schema.String,
  schema: Schema.optional(Schema.String),
  role: Schema.optional(Schema.String),
  cidrs: Schema.optional(Schema.Array(Schema.String)),
}).annotations({
  [ApiMethod]: "PUT",
  [ApiPath]: (input: { organization: string; database: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/cidrs/${input.id}`,
  [ApiPathParams]: ["organization", "database", "id"] as const,
});
export type UpdateDatabasePostgresCidrInput = typeof UpdateDatabasePostgresCidrInput.Type;

// Output Schema
export const UpdateDatabasePostgresCidrOutput = Schema.Struct({
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
export type UpdateDatabasePostgresCidrOutput = typeof UpdateDatabasePostgresCidrOutput.Type;

// Error Schemas
export class UpdateDatabasePostgresCidrUnauthorized extends Schema.TaggedError<UpdateDatabasePostgresCidrUnauthorized>()(
  "UpdateDatabasePostgresCidrUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
).pipe(Category.withAuthError) {}

export class UpdateDatabasePostgresCidrForbidden extends Schema.TaggedError<UpdateDatabasePostgresCidrForbidden>()(
  "UpdateDatabasePostgresCidrForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
).pipe(Category.withAuthError) {}

export class UpdateDatabasePostgresCidrNotfound extends Schema.TaggedError<UpdateDatabasePostgresCidrNotfound>()(
  "UpdateDatabasePostgresCidrNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
).pipe(Category.withNotFoundError) {}

export class UpdateDatabasePostgresCidrUnprocessableentity extends Schema.TaggedError<UpdateDatabasePostgresCidrUnprocessableentity>()(
  "UpdateDatabasePostgresCidrUnprocessableentity",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
).pipe(Category.withBadRequestError) {}

export class UpdateDatabasePostgresCidrInternalservererror extends Schema.TaggedError<UpdateDatabasePostgresCidrInternalservererror>()(
  "UpdateDatabasePostgresCidrInternalservererror",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "internal_server_error" },
).pipe(Category.withServerError) {}

// The operation
/**
 * Update an IP restriction entry
 *
 * @param organization - The name of the organization the database belongs to
 * @param database - The name of the database
 * @param id - The ID of the IP restriction entry
 * @param schema - The PostgreSQL schema to restrict access to. Leave empty to allow access to all schemas.
 * @param role - The PostgreSQL role to restrict access to. Leave empty to allow access for all roles.
 * @param cidrs - List of IPv4 CIDR ranges (e.g., ['192.168.1.0/24', '192.168.1.1/32']). Only provided fields will be updated.
 */
export const updateDatabasePostgresCidr = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateDatabasePostgresCidrInput,
  outputSchema: UpdateDatabasePostgresCidrOutput,
  errors: [UpdateDatabasePostgresCidrUnauthorized, UpdateDatabasePostgresCidrForbidden, UpdateDatabasePostgresCidrNotfound, UpdateDatabasePostgresCidrUnprocessableentity, UpdateDatabasePostgresCidrInternalservererror],
}));
