import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ListOauthApplicationsInput = Schema.Struct({
  organization: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}/oauth-applications`,
});
export type ListOauthApplicationsInput = typeof ListOauthApplicationsInput.Type;

// Output Schema
export const ListOauthApplicationsOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.Number,
  next_page_url: Schema.String,
  prev_page: Schema.Number,
  prev_page_url: Schema.String,
  data: Schema.Array(Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    redirect_uri: Schema.String,
    domain: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    scopes: Schema.Array(Schema.String),
    avatar: Schema.String,
    client_id: Schema.String,
    tokens: Schema.Number,
  })),
});
export type ListOauthApplicationsOutput = typeof ListOauthApplicationsOutput.Type;

// Error Schemas
export class ListOauthApplicationsUnauthorized extends Schema.TaggedError<ListOauthApplicationsUnauthorized>()(
  "ListOauthApplicationsUnauthorized",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListOauthApplicationsForbidden extends Schema.TaggedError<ListOauthApplicationsForbidden>()(
  "ListOauthApplicationsForbidden",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListOauthApplicationsNotfound extends Schema.TaggedError<ListOauthApplicationsNotfound>()(
  "ListOauthApplicationsNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const listOauthApplications = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListOauthApplicationsInput,
  outputSchema: ListOauthApplicationsOutput,
  errors: [ListOauthApplicationsUnauthorized, ListOauthApplicationsForbidden, ListOauthApplicationsNotfound],
}));
