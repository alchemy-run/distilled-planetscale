import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const ListDeployOperationsInput = Schema.Struct({
  number: Schema.Number,
  organization: Schema.String,
  database: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { number: string; organization: string; database: string }) =>
    `/organizations/${input.organization}/databases/${input.database}/deploy-requests/${input.number}/operations`,
  [ApiPathParams]: ["number", "organization", "database"] as const,
});
export type ListDeployOperationsInput = typeof ListDeployOperationsInput.Type;

// Output Schema
export const ListDeployOperationsOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.NullOr(Schema.Number),
  next_page_url: Schema.NullOr(Schema.String),
  prev_page: Schema.NullOr(Schema.Number),
  prev_page_url: Schema.NullOr(Schema.String),
  data: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      state: Schema.Literal("pending", "queued", "in_progress", "complete", "cancelled", "error"),
      keyspace_name: Schema.String,
      table_name: Schema.String,
      operation_name: Schema.String,
      eta_seconds: Schema.Number,
      progress_percentage: Schema.Number,
      deploy_error_docs_url: Schema.String,
      ddl_statement: Schema.String,
      syntax_highlighted_ddl: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
      throttled_at: Schema.String,
      can_drop_data: Schema.Boolean,
      table_locked: Schema.Boolean,
      table_recently_used: Schema.Boolean,
      table_recently_used_at: Schema.String,
      removed_foreign_key_names: Schema.Array(Schema.String),
      deploy_errors: Schema.String,
    }),
  ),
});
export type ListDeployOperationsOutput = typeof ListDeployOperationsOutput.Type;

// Error Schemas
export class ListDeployOperationsUnauthorized extends Schema.TaggedError<ListDeployOperationsUnauthorized>()(
  "ListDeployOperationsUnauthorized",
  {
    number: Schema.NumberFromString,
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListDeployOperationsForbidden extends Schema.TaggedError<ListDeployOperationsForbidden>()(
  "ListDeployOperationsForbidden",
  {
    number: Schema.NumberFromString,
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListDeployOperationsNotfound extends Schema.TaggedError<ListDeployOperationsNotfound>()(
  "ListDeployOperationsNotfound",
  {
    number: Schema.NumberFromString,
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * List deploy operations
 *
 * List deploy operations for a deploy request
 *
 * @param number - The number of the deploy request
 * @param organization - The name of the deploy request's organization
 * @param database - The name of the deploy request's database
 * @param page - If provided, specifies the page offset of returned results
 * @param per_page - If provided, specifies the number of returned results
 */
export const listDeployOperations = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListDeployOperationsInput,
  outputSchema: ListDeployOperationsOutput,
  errors: [
    ListDeployOperationsUnauthorized,
    ListDeployOperationsForbidden,
    ListDeployOperationsNotfound,
  ],
}));
