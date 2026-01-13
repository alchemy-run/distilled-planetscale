import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const RenewPasswordInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string; branch: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/passwords/${input.id}/renew`,
});
export type RenewPasswordInput = typeof RenewPasswordInput.Type;

// Output Schema
export const RenewPasswordOutput = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  role: Schema.Literal("reader", "writer", "admin", "readwriter"),
  cidrs: Schema.Array(Schema.String),
  created_at: Schema.String,
  deleted_at: Schema.String,
  expires_at: Schema.String,
  last_used_at: Schema.String,
  expired: Schema.Boolean,
  direct_vtgate: Schema.Boolean,
  direct_vtgate_addresses: Schema.Array(Schema.String),
  ttl_seconds: Schema.Number,
  access_host_url: Schema.String,
  access_host_regional_url: Schema.String,
  access_host_regional_urls: Schema.Array(Schema.String),
  actor: Schema.Struct({
    id: Schema.String,
    display_name: Schema.String,
    avatar_url: Schema.String,
  }),
  region: Schema.Struct({
    id: Schema.String,
    provider: Schema.String,
    enabled: Schema.Boolean,
    public_ip_addresses: Schema.Array(Schema.String),
    display_name: Schema.String,
    location: Schema.String,
    slug: Schema.String,
    current_default: Schema.Boolean,
  }),
  username: Schema.String,
  plain_text: Schema.String,
  replica: Schema.Boolean,
  renewable: Schema.Boolean,
  database_branch: Schema.Struct({
    name: Schema.String,
    id: Schema.String,
    production: Schema.Boolean,
    mysql_edge_address: Schema.String,
    private_edge_connectivity: Schema.Boolean,
  }),
});
export type RenewPasswordOutput = typeof RenewPasswordOutput.Type;

// Error Schemas
export class RenewPasswordUnauthorized extends Schema.TaggedError<RenewPasswordUnauthorized>()(
  "RenewPasswordUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class RenewPasswordForbidden extends Schema.TaggedError<RenewPasswordForbidden>()(
  "RenewPasswordForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class RenewPasswordNotfound extends Schema.TaggedError<RenewPasswordNotfound>()(
  "RenewPasswordNotfound",
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
/**
 * Renew a password
 *
 * @param organization - The name of the organization the password belongs to
 * @param database - The name of the database the password belongs to
 * @param branch - The name of the branch the password belongs to
 * @param id - The ID of the password
 */
export const renewPassword = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RenewPasswordInput,
  outputSchema: RenewPasswordOutput,
  errors: [RenewPasswordUnauthorized, RenewPasswordForbidden, RenewPasswordNotfound],
}));
