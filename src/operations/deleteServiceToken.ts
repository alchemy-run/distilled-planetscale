import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const DeleteServiceTokenInput = Schema.Struct({
  organization: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "DELETE",
  [ApiPath]: (input: { organization: string; id: string }) => `/organizations/${input.organization}/service-tokens/${input.id}`,
});
export type DeleteServiceTokenInput = typeof DeleteServiceTokenInput.Type;

// Output Schema
export const DeleteServiceTokenOutput = Schema.Void;
export type DeleteServiceTokenOutput = typeof DeleteServiceTokenOutput.Type;

// Error Schemas
export class DeleteServiceTokenUnauthorized extends Schema.TaggedError<DeleteServiceTokenUnauthorized>()(
  "DeleteServiceTokenUnauthorized",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class DeleteServiceTokenForbidden extends Schema.TaggedError<DeleteServiceTokenForbidden>()(
  "DeleteServiceTokenForbidden",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class DeleteServiceTokenNotfound extends Schema.TaggedError<DeleteServiceTokenNotfound>()(
  "DeleteServiceTokenNotfound",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Delete a service token
 *
 * Delete a service token from the organization.
 *
 * @param organization - The name of the organization
 * @param id - The ID of the service token
 */
export const deleteServiceToken = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: DeleteServiceTokenInput,
  outputSchema: DeleteServiceTokenOutput,
  errors: [DeleteServiceTokenUnauthorized, DeleteServiceTokenForbidden, DeleteServiceTokenNotfound],
}));
