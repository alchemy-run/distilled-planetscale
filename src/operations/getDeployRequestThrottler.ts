import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const GetDeployRequestThrottlerInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  number: Schema.Number,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string; number: string }) => `/organizations/${input.organization}/databases/${input.database}/deploy-requests/${input.number}/throttler`,
  [ApiPathParams]: ["organization", "database", "number"] as const,
});
export type GetDeployRequestThrottlerInput = typeof GetDeployRequestThrottlerInput.Type;

// Output Schema
export const GetDeployRequestThrottlerOutput = Schema.Struct({
  keyspaces: Schema.Array(Schema.String),
  configurable: Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
    deleted_at: Schema.String,
  }),
  configurations: Schema.Array(Schema.Struct({
    keyspace_name: Schema.String,
    ratio: Schema.Number,
  })),
});
export type GetDeployRequestThrottlerOutput = typeof GetDeployRequestThrottlerOutput.Type;

// Error Schemas
export class GetDeployRequestThrottlerUnauthorized extends Schema.TaggedError<GetDeployRequestThrottlerUnauthorized>()(
  "GetDeployRequestThrottlerUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.NumberFromString,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetDeployRequestThrottlerForbidden extends Schema.TaggedError<GetDeployRequestThrottlerForbidden>()(
  "GetDeployRequestThrottlerForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.NumberFromString,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetDeployRequestThrottlerNotfound extends Schema.TaggedError<GetDeployRequestThrottlerNotfound>()(
  "GetDeployRequestThrottlerNotfound",
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
 * Get deploy request throttler configurations
 *
 * @param organization - The name of the deploy request's organization
 * @param database - The name of the deploy request's database
 * @param number - The number of the deploy request
 */
export const getDeployRequestThrottler = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetDeployRequestThrottlerInput,
  outputSchema: GetDeployRequestThrottlerOutput,
  errors: [GetDeployRequestThrottlerUnauthorized, GetDeployRequestThrottlerForbidden, GetDeployRequestThrottlerNotfound],
}));
