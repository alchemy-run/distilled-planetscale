import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const DeleteDatabaseInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; database: string }) => `/organizations/${input.organization}/databases/${input.database}`,
});
export type DeleteDatabaseInput = typeof DeleteDatabaseInput.Type;

// Output Schema
export const DeleteDatabaseOutput = Schema.Void;
export type DeleteDatabaseOutput = typeof DeleteDatabaseOutput.Type;

// Error Schemas
export class DeleteDatabaseUnauthorized extends Schema.TaggedError<DeleteDatabaseUnauthorized>()(
  "DeleteDatabaseUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DeleteDatabaseForbidden extends Schema.TaggedError<DeleteDatabaseForbidden>()(
  "DeleteDatabaseForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DeleteDatabaseNotfound extends Schema.TaggedError<DeleteDatabaseNotfound>()(
  "DeleteDatabaseNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Delete a database
 *
 * @param organization - The name of the organization the database belongs to
 * @param database - The name of the database
 */
export const deleteDatabase = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteDatabaseInput,
  outputSchema: DeleteDatabaseOutput,
  errors: [DeleteDatabaseUnauthorized, DeleteDatabaseForbidden, DeleteDatabaseNotfound],
}));
