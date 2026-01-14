import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const ListAuditLogsInput = Schema.Struct({
  organization: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}/audit-log`,
  [ApiPathParams]: ["organization"] as const,
});
export type ListAuditLogsInput = typeof ListAuditLogsInput.Type;

// Output Schema
export const ListAuditLogsOutput = Schema.Struct({
  has_next: Schema.Boolean,
  has_prev: Schema.Boolean,
  cursor_start: Schema.NullOr(Schema.String),
  cursor_end: Schema.NullOr(Schema.String),
  data: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      actor_id: Schema.String,
      actor_type: Schema.String,
      auditable_id: Schema.String,
      auditable_type: Schema.String,
      target_id: Schema.String,
      target_type: Schema.String,
      location: Schema.NullOr(Schema.String),
      target_display_name: Schema.String,
      audit_action: Schema.String,
      action: Schema.String,
      actor_display_name: Schema.String,
      auditable_display_name: Schema.String,
      remote_ip: Schema.NullOr(Schema.String),
      created_at: Schema.String,
      updated_at: Schema.String,
      metadata: Schema.Unknown,
    }),
  ),
});
export type ListAuditLogsOutput = typeof ListAuditLogsOutput.Type;

// Error Schemas
export class ListAuditLogsUnauthorized extends Schema.TaggedError<ListAuditLogsUnauthorized>()(
  "ListAuditLogsUnauthorized",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListAuditLogsForbidden extends Schema.TaggedError<ListAuditLogsForbidden>()(
  "ListAuditLogsForbidden",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListAuditLogsNotfound extends Schema.TaggedError<ListAuditLogsNotfound>()(
  "ListAuditLogsNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * List audit logs
 *
 * @param organization - The name of the organization
 */
export const listAuditLogs = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAuditLogsInput,
  outputSchema: ListAuditLogsOutput,
  errors: [ListAuditLogsUnauthorized, ListAuditLogsForbidden, ListAuditLogsNotfound],
}));
