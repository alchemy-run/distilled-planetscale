import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const UpdatePasswordInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  branch: Schema.String,
  id: Schema.String,
  name: Schema.optional(Schema.String),
  cidrs: Schema.optional(Schema.Array(Schema.String)),
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string; database: string; branch: string; id: string }) => `/organizations/${input.organization}/databases/${input.database}/branches/${input.branch}/passwords/${input.id}`,
});
export type UpdatePasswordInput = typeof UpdatePasswordInput.Type;

// Output Schema
export const UpdatePasswordOutput = Schema.Struct({
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
export type UpdatePasswordOutput = typeof UpdatePasswordOutput.Type;

// Error Schemas
export class UpdatePasswordUnauthorized extends Schema.TaggedError<UpdatePasswordUnauthorized>()(
  "UpdatePasswordUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdatePasswordForbidden extends Schema.TaggedError<UpdatePasswordForbidden>()(
  "UpdatePasswordForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    branch: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdatePasswordNotfound extends Schema.TaggedError<UpdatePasswordNotfound>()(
  "UpdatePasswordNotfound",
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
export const updatePassword = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdatePasswordInput,
  outputSchema: UpdatePasswordOutput,
  errors: [UpdatePasswordUnauthorized, UpdatePasswordForbidden, UpdatePasswordNotfound],
}));
