import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const DeleteDatabasePostgresCidrInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/cidrs/${input.id}`,
});
export type DeleteDatabasePostgresCidrInput = typeof DeleteDatabasePostgresCidrInput.Type;

// Output Schema
export const DeleteDatabasePostgresCidrOutput = Schema.Void;
export type DeleteDatabasePostgresCidrOutput = typeof DeleteDatabasePostgresCidrOutput.Type;

// Error Schemas
export class DeleteDatabasePostgresCidrUnauthorized extends Schema.TaggedError<DeleteDatabasePostgresCidrUnauthorized>()(
  "DeleteDatabasePostgresCidrUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DeleteDatabasePostgresCidrForbidden extends Schema.TaggedError<DeleteDatabasePostgresCidrForbidden>()(
  "DeleteDatabasePostgresCidrForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DeleteDatabasePostgresCidrNotfound extends Schema.TaggedError<DeleteDatabasePostgresCidrNotfound>()(
  "DeleteDatabasePostgresCidrNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

export class DeleteDatabasePostgresCidrUnprocessableentity extends Schema.TaggedError<DeleteDatabasePostgresCidrUnprocessableentity>()(
  "DeleteDatabasePostgresCidrUnprocessableentity",
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
 * Delete an IP restriction entry
 *
 * @param organization - The name of the organization the database belongs to
 * @param database - The name of the database
 * @param id - The ID of the IP restriction entry
 */
export const deleteDatabasePostgresCidr = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteDatabasePostgresCidrInput,
  outputSchema: DeleteDatabasePostgresCidrOutput,
  errors: [DeleteDatabasePostgresCidrUnauthorized, DeleteDatabasePostgresCidrForbidden, DeleteDatabasePostgresCidrNotfound, DeleteDatabasePostgresCidrUnprocessableentity],
}));
