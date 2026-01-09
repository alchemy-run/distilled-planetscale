import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const UpdateBouncerResizeRequestInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  bouncer: Schema.String,
  bouncer_size: Schema.optional(Schema.String),
  replicas_per_cell: Schema.optional(Schema.Number),
  parameters: Schema.optional(Schema.Unknown),
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string; database: string; branch: string; bouncer: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/bouncers/${input.bouncer}/resizes`,
});
export type UpdateBouncerResizeRequestInput = typeof UpdateBouncerResizeRequestInput.Type;

// Output Schema
export const UpdateBouncerResizeRequestOutput = Schema.Struct({
  id: Schema.String,
  state: Schema.Literal("pending", "resizing", "canceled", "completed"),
  replicas_per_cell: Schema.Number,
  parameters: Schema.Unknown,
  previous_replicas_per_cell: Schema.Number,
  previous_parameters: Schema.Unknown,
  started_at: Schema.String,
  completed_at: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  actor: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
  bouncer: Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    deleted_at: Schema.String,
  }),
  sku: Schema.Struct({
    name: Schema.String,
    display_name: Schema.String,
    cpu: Schema.String,
    ram: Schema.Number,
    sort_order: Schema.Number,
  }),
  previous_sku: Schema.Struct({
    name: Schema.String,
    display_name: Schema.String,
    cpu: Schema.String,
    ram: Schema.Number,
    sort_order: Schema.Number,
  }),
});
export type UpdateBouncerResizeRequestOutput = typeof UpdateBouncerResizeRequestOutput.Type;

// Error Schemas
export class UpdateBouncerResizeRequestUnauthorized extends Schema.TaggedError<UpdateBouncerResizeRequestUnauthorized>()(
  "UpdateBouncerResizeRequestUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdateBouncerResizeRequestForbidden extends Schema.TaggedError<UpdateBouncerResizeRequestForbidden>()(
  "UpdateBouncerResizeRequestForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateBouncerResizeRequestNotfound extends Schema.TaggedError<UpdateBouncerResizeRequestNotfound>()(
  "UpdateBouncerResizeRequestNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const updateBouncerResizeRequest = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateBouncerResizeRequestInput,
  outputSchema: UpdateBouncerResizeRequestOutput,
  errors: [UpdateBouncerResizeRequestUnauthorized, UpdateBouncerResizeRequestForbidden, UpdateBouncerResizeRequestNotfound],
}));
