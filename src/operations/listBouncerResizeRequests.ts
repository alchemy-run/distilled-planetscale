import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const ListBouncerResizeRequestsInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  bouncer: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string; bouncer: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/bouncers/${input.bouncer}/resizes`,
  [ApiPathParams]: ["organization", "database", "branch", "bouncer"] as const,
});
export type ListBouncerResizeRequestsInput = typeof ListBouncerResizeRequestsInput.Type;

// Output Schema
export const ListBouncerResizeRequestsOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.NullOr(Schema.Number),
  next_page_url: Schema.NullOr(Schema.String),
  prev_page: Schema.NullOr(Schema.Number),
  prev_page_url: Schema.NullOr(Schema.String),
  data: Schema.Array(Schema.Struct({
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
  })),
});
export type ListBouncerResizeRequestsOutput = typeof ListBouncerResizeRequestsOutput.Type;

// Error Schemas
export class ListBouncerResizeRequestsUnauthorized extends Schema.TaggedError<ListBouncerResizeRequestsUnauthorized>()(
  "ListBouncerResizeRequestsUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListBouncerResizeRequestsForbidden extends Schema.TaggedError<ListBouncerResizeRequestsForbidden>()(
  "ListBouncerResizeRequestsForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    bouncer: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListBouncerResizeRequestsNotfound extends Schema.TaggedError<ListBouncerResizeRequestsNotfound>()(
  "ListBouncerResizeRequestsNotfound",
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
/**
 * Get bouncer resize requests
 *
 * @param organization - The name of the organization that owns this resource
 * @param database - The name of the database that owns this resource
 * @param branch - The name of the branch that owns this resource
 * @param bouncer - The name of the bouncer
 * @param page - If provided, specifies the page offset of returned results
 * @param per_page - If provided, specifies the number of returned results
 */
export const listBouncerResizeRequests = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListBouncerResizeRequestsInput,
  outputSchema: ListBouncerResizeRequestsOutput,
  errors: [ListBouncerResizeRequestsUnauthorized, ListBouncerResizeRequestsForbidden, ListBouncerResizeRequestsNotfound],
}));
