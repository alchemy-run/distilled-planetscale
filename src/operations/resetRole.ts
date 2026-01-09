import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ResetRoleInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string; branch: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/roles/${input.id}/reset`,
});
export type ResetRoleInput = typeof ResetRoleInput.Type;

// Output Schema
export const ResetRoleOutput = Schema.Struct({
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
export type ResetRoleOutput = typeof ResetRoleOutput.Type;

// Error Schemas
export class ResetRoleUnauthorized extends Schema.TaggedError<ResetRoleUnauthorized>()(
  "ResetRoleUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ResetRoleForbidden extends Schema.TaggedError<ResetRoleForbidden>()(
  "ResetRoleForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ResetRoleNotfound extends Schema.TaggedError<ResetRoleNotfound>()(
  "ResetRoleNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const resetRole = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ResetRoleInput,
  outputSchema: ResetRoleOutput,
  errors: [ResetRoleUnauthorized, ResetRoleForbidden, ResetRoleNotfound],
}));
