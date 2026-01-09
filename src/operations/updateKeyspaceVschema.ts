import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const UpdateKeyspaceVschemaInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  keyspace: Schema.String,
  vschema: Schema.String,
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string; database: string; branch: string; keyspace: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/keyspaces/${input.keyspace}/vschema`,
});
export type UpdateKeyspaceVschemaInput = typeof UpdateKeyspaceVschemaInput.Type;

// Output Schema
export const UpdateKeyspaceVschemaOutput = Schema.Struct({
  raw: Schema.String,
});
export type UpdateKeyspaceVschemaOutput = typeof UpdateKeyspaceVschemaOutput.Type;

// Error Schemas
export class UpdateKeyspaceVschemaUnauthorized extends Schema.TaggedError<UpdateKeyspaceVschemaUnauthorized>()(
  "UpdateKeyspaceVschemaUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdateKeyspaceVschemaForbidden extends Schema.TaggedError<UpdateKeyspaceVschemaForbidden>()(
  "UpdateKeyspaceVschemaForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateKeyspaceVschemaNotfound extends Schema.TaggedError<UpdateKeyspaceVschemaNotfound>()(
  "UpdateKeyspaceVschemaNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

export class UpdateKeyspaceVschemaUnprocessableentity extends Schema.TaggedError<UpdateKeyspaceVschemaUnprocessableentity>()(
  "UpdateKeyspaceVschemaUnprocessableentity",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    keyspace: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unprocessable_entity" },
) {}

// The operation
export const updateKeyspaceVschema = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateKeyspaceVschemaInput,
  outputSchema: UpdateKeyspaceVschemaOutput,
  errors: [UpdateKeyspaceVschemaUnauthorized, UpdateKeyspaceVschemaForbidden, UpdateKeyspaceVschemaNotfound, UpdateKeyspaceVschemaUnprocessableentity],
}));
