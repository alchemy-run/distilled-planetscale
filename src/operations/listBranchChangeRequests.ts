import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ListBranchChangeRequestsInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/changes`,
});
export type ListBranchChangeRequestsInput = typeof ListBranchChangeRequestsInput.Type;

// Output Schema
export const ListBranchChangeRequestsOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.NullOr(Schema.Number),
  next_page_url: Schema.NullOr(Schema.String),
  prev_page: Schema.NullOr(Schema.Number),
  prev_page_url: Schema.NullOr(Schema.String),
  data: Schema.Array(Schema.Struct({
    id: Schema.String,
    restart: Schema.Array(Schema.Number),
    state: Schema.Literal("queued", "pending", "resizing", "canceled", "completed"),
    started_at: Schema.String,
    completed_at: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    actor: Schema.Struct({
      id: Schema.String,
      display_name: Schema.String,
      avatar_url: Schema.String,
    }),
    cluster_name: Schema.String,
    cluster_display_name: Schema.String,
    cluster_metal: Schema.Boolean,
    replicas: Schema.Number,
    parameters: Schema.Unknown,
    previous_cluster_name: Schema.String,
    previous_cluster_display_name: Schema.String,
    previous_cluster_metal: Schema.Boolean,
    previous_replicas: Schema.Number,
    previous_parameters: Schema.Unknown,
    minimum_storage_bytes: Schema.Number,
    maximum_storage_bytes: Schema.Number,
    storage_autoscaling: Schema.Boolean,
    storage_shrinking: Schema.Boolean,
    storage_type: Schema.Literal("gp3", "io2", "pd_ssd"),
    storage_iops: Schema.Number,
    storage_throughput_mibs: Schema.Number,
    previous_minimum_storage_bytes: Schema.Number,
    previous_maximum_storage_bytes: Schema.Number,
    previous_storage_autoscaling: Schema.Boolean,
    previous_storage_shrinking: Schema.Boolean,
    previous_storage_type: Schema.String,
    previous_storage_iops: Schema.Number,
    previous_storage_throughput_mibs: Schema.Number,
  })),
});
export type ListBranchChangeRequestsOutput = typeof ListBranchChangeRequestsOutput.Type;

// Error Schemas
export class ListBranchChangeRequestsUnauthorized extends Schema.TaggedError<ListBranchChangeRequestsUnauthorized>()(
  "ListBranchChangeRequestsUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListBranchChangeRequestsForbidden extends Schema.TaggedError<ListBranchChangeRequestsForbidden>()(
  "ListBranchChangeRequestsForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListBranchChangeRequestsNotfound extends Schema.TaggedError<ListBranchChangeRequestsNotfound>()(
  "ListBranchChangeRequestsNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Get branch change requests
 *
 * @param organization - The name of the organization that owns this resource
 * @param database - The name of the database that owns this resource
 * @param branch - The name of the branch that owns this resource
 * @param page - If provided, specifies the page offset of returned results
 * @param per_page - If provided, specifies the number of returned results
 */
export const listBranchChangeRequests = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListBranchChangeRequestsInput,
  outputSchema: ListBranchChangeRequestsOutput,
  errors: [ListBranchChangeRequestsUnauthorized, ListBranchChangeRequestsForbidden, ListBranchChangeRequestsNotfound],
}));
