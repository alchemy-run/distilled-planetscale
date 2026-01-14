import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const ResetDefaultRoleInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string; branch: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/roles/reset-default`,
  [ApiPathParams]: ["organization", "database", "branch"] as const,
});
export type ResetDefaultRoleInput = typeof ResetDefaultRoleInput.Type;

// Output Schema
export const ResetDefaultRoleOutput = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  access_host_url: Schema.String,
  private_access_host_url: Schema.String,
  private_connection_service_name: Schema.String,
  username: Schema.String,
  password: Schema.String,
  database_name: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  deleted_at: Schema.String,
  expires_at: Schema.String,
  dropped_at: Schema.String,
  disabled_at: Schema.String,
  drop_failed: Schema.String,
  expired: Schema.Boolean,
  default: Schema.Boolean,
  ttl: Schema.Number,
  inherited_roles: Schema.Array(Schema.Literal("pscale_managed", "pg_checkpoint", "pg_create_subscription", "pg_maintain", "pg_monitor", "pg_read_all_data", "pg_read_all_settings", "pg_read_all_stats", "pg_signal_backend", "pg_stat_scan_tables", "pg_use_reserved_connections", "pg_write_all_data", "postgres")),
  branch: Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    deleted_at: Schema.String,
  }),
  actor: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
});
export type ResetDefaultRoleOutput = typeof ResetDefaultRoleOutput.Type;

// Error Schemas
export class ResetDefaultRoleUnauthorized extends Schema.TaggedError<ResetDefaultRoleUnauthorized>()(
  "ResetDefaultRoleUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ResetDefaultRoleForbidden extends Schema.TaggedError<ResetDefaultRoleForbidden>()(
  "ResetDefaultRoleForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ResetDefaultRoleNotfound extends Schema.TaggedError<ResetDefaultRoleNotfound>()(
  "ResetDefaultRoleNotfound",
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
 * Reset default credentials
 *
 * @param organization - The name of the organization that owns this resource
 * @param database - The name of the database that owns this resource
 * @param branch - The name of the branch that owns this resource
 */
export const resetDefaultRole = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ResetDefaultRoleInput,
  outputSchema: ResetDefaultRoleOutput,
  errors: [ResetDefaultRoleUnauthorized, ResetDefaultRoleForbidden, ResetDefaultRoleNotfound],
}));
