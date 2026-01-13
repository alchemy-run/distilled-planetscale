import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const GetDatabasePostgresCidrInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/cidrs/${input.id}`,
  [ApiPathParams]: ["organization", "database", "id"] as const,
});
export type GetDatabasePostgresCidrInput = typeof GetDatabasePostgresCidrInput.Type;

// Output Schema
export const GetDatabasePostgresCidrOutput = Schema.Struct({
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
export type GetDatabasePostgresCidrOutput = typeof GetDatabasePostgresCidrOutput.Type;

// Error Schemas
export class GetDatabasePostgresCidrUnauthorized extends Schema.TaggedError<GetDatabasePostgresCidrUnauthorized>()(
  "GetDatabasePostgresCidrUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetDatabasePostgresCidrForbidden extends Schema.TaggedError<GetDatabasePostgresCidrForbidden>()(
  "GetDatabasePostgresCidrForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetDatabasePostgresCidrNotfound extends Schema.TaggedError<GetDatabasePostgresCidrNotfound>()(
  "GetDatabasePostgresCidrNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

export class GetDatabasePostgresCidrUnprocessableentity extends Schema.TaggedError<GetDatabasePostgresCidrUnprocessableentity>()(
  "GetDatabasePostgresCidrUnprocessableentity",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
) {}

// The operation
/**
 * Get an IP restriction entry
 *
 * @param organization - The name of the organization the database belongs to
 * @param database - The name of the database
 * @param id - The ID of the IP restriction entry
 */
export const getDatabasePostgresCidr = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetDatabasePostgresCidrInput,
  outputSchema: GetDatabasePostgresCidrOutput,
  errors: [GetDatabasePostgresCidrUnauthorized, GetDatabasePostgresCidrForbidden, GetDatabasePostgresCidrNotfound, GetDatabasePostgresCidrUnprocessableentity],
}));
