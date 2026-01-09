import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

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
) {}

export class UpdateDatabasePostgresCidrForbidden extends Schema.TaggedError<UpdateDatabasePostgresCidrForbidden>()(
  "UpdateDatabasePostgresCidrForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateDatabasePostgresCidrNotfound extends Schema.TaggedError<UpdateDatabasePostgresCidrNotfound>()(
  "UpdateDatabasePostgresCidrNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

export class UpdateDatabasePostgresCidrUnprocessableentity extends Schema.TaggedError<UpdateDatabasePostgresCidrUnprocessableentity>()(
  "UpdateDatabasePostgresCidrUnprocessableentity",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
) {}

// The operation
export const updateDatabasePostgresCidr = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateDatabasePostgresCidrInput,
  outputSchema: UpdateDatabasePostgresCidrOutput,
  errors: [UpdateDatabasePostgresCidrUnauthorized, UpdateDatabasePostgresCidrForbidden, UpdateDatabasePostgresCidrNotfound, UpdateDatabasePostgresCidrUnprocessableentity],
}));
