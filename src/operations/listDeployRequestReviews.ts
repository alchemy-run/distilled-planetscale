import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ListDeployRequestReviewsInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  number: Schema.Number,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; number: string }) => `/organizations/${input.organization}/databases/${input.database}/deploy-requests/${input.number}/reviews`,
});
export type ListDeployRequestReviewsInput = typeof ListDeployRequestReviewsInput.Type;

// Output Schema
export const ListDeployRequestReviewsOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.Number,
  next_page_url: Schema.String,
  prev_page: Schema.Number,
  prev_page_url: Schema.String,
  data: Schema.Array(Schema.Struct({
    id: Schema.String,
    body: Schema.String,
    html_body: Schema.String,
    state: Schema.Literal("commented", "approved"),
    created_at: Schema.String,
    updated_at: Schema.String,
    actor: Schema.Struct({
      id: Schema.String,
      display_name: Schema.String,
      avatar_url: Schema.String,
    }),
  })),
});
export type ListDeployRequestReviewsOutput = typeof ListDeployRequestReviewsOutput.Type;

// Error Schemas
export class ListDeployRequestReviewsUnauthorized extends Schema.TaggedError<ListDeployRequestReviewsUnauthorized>()(
  "ListDeployRequestReviewsUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListDeployRequestReviewsForbidden extends Schema.TaggedError<ListDeployRequestReviewsForbidden>()(
  "ListDeployRequestReviewsForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListDeployRequestReviewsNotfound extends Schema.TaggedError<ListDeployRequestReviewsNotfound>()(
  "ListDeployRequestReviewsNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const listDeployRequestReviews = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListDeployRequestReviewsInput,
  outputSchema: ListDeployRequestReviewsOutput,
  errors: [ListDeployRequestReviewsUnauthorized, ListDeployRequestReviewsForbidden, ListDeployRequestReviewsNotfound],
}));
