import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const GetPasswordInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; branch: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/passwords/${input.id}`,
  [ApiPathParams]: ["organization", "database", "branch", "id"] as const,
});
export type GetPasswordInput = typeof GetPasswordInput.Type;

// Output Schema
export const GetPasswordOutput = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  role: Schema.Literal("reader", "writer", "admin", "readwriter"),
  cidrs: Schema.NullOr(Schema.Array(Schema.String)),
  created_at: Schema.String,
  deleted_at: Schema.NullOr(Schema.String),
  expires_at: Schema.NullOr(Schema.String),
  last_used_at: Schema.NullOr(Schema.String),
  expired: Schema.Boolean,
  direct_vtgate: Schema.Boolean,
  direct_vtgate_addresses: Schema.Array(Schema.String),
  ttl_seconds: Schema.NullOr(Schema.Number),
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
  plain_text: Schema.NullOr(Schema.String),
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
export type GetPasswordOutput = typeof GetPasswordOutput.Type;

// Error Schemas
export class GetPasswordUnauthorized extends Schema.TaggedError<GetPasswordUnauthorized>()(
  "GetPasswordUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetPasswordForbidden extends Schema.TaggedError<GetPasswordForbidden>()(
  "GetPasswordForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetPasswordNotfound extends Schema.TaggedError<GetPasswordNotfound>()(
  "GetPasswordNotfound",
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
 * Get a password
 *
 * @param organization - The name of the organization the password belongs to
 * @param database - The name of the database the password belongs to
 * @param branch - The name of the branch the password belongs to
 * @param id - The ID of the password
 */
export const getPassword = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetPasswordInput,
  outputSchema: GetPasswordOutput,
  errors: [GetPasswordUnauthorized, GetPasswordForbidden, GetPasswordNotfound],
}));
