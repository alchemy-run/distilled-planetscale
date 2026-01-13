import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const ReviewDeployRequestInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  number: Schema.Number,
  state: Schema.optional(Schema.Literal("commented", "approved")),
  body: Schema.optional(Schema.String),
}).annotations({
  [ApiMethod]: "POST",
  [ApiPath]: (input: { organization: string; database: string; number: string }) => `/organizations/${input.organization}/databases/${input.database}/deploy-requests/${input.number}/reviews`,
  [ApiPathParams]: ["organization", "database", "number"] as const,
});
export type ReviewDeployRequestInput = typeof ReviewDeployRequestInput.Type;

// Output Schema
export const ReviewDeployRequestOutput = Schema.Struct({
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
});
export type ReviewDeployRequestOutput = typeof ReviewDeployRequestOutput.Type;

// Error Schemas
export class ReviewDeployRequestUnauthorized extends Schema.TaggedError<ReviewDeployRequestUnauthorized>()(
  "ReviewDeployRequestUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.NumberFromString,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ReviewDeployRequestForbidden extends Schema.TaggedError<ReviewDeployRequestForbidden>()(
  "ReviewDeployRequestForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.NumberFromString,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ReviewDeployRequestNotfound extends Schema.TaggedError<ReviewDeployRequestNotfound>()(
  "ReviewDeployRequestNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.NumberFromString,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Review a deploy request
 *
 * Review a deploy request by either approving or commenting on the deploy request
 *
 * @param organization - The name of the organization the deploy request belongs to
 * @param database - The name of the database the deploy request belongs to
 * @param number - The number of the deploy request
 * @param state - Whether the review is a comment or approval. Service tokens must have corresponding access (either `approve_deploy_request` or `review_deploy_request`)
 * @param body - Deploy request review comments
 */
export const reviewDeployRequest = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ReviewDeployRequestInput,
  outputSchema: ReviewDeployRequestOutput,
  errors: [ReviewDeployRequestUnauthorized, ReviewDeployRequestForbidden, ReviewDeployRequestNotfound],
}));
