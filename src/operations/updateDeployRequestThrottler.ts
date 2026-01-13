import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const UpdateDeployRequestThrottlerInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  number: Schema.Number,
  ratio: Schema.optional(Schema.Number),
  configurations: Schema.optional(Schema.Array(Schema.String)),
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string; database: string; number: string }) => `/organizations/${input.organization}/databases/${input.database}/deploy-requests/${input.number}/throttler`,
});
export type UpdateDeployRequestThrottlerInput = typeof UpdateDeployRequestThrottlerInput.Type;

// Output Schema
export const UpdateDeployRequestThrottlerOutput = Schema.Struct({
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
export type UpdateDeployRequestThrottlerOutput = typeof UpdateDeployRequestThrottlerOutput.Type;

// Error Schemas
export class UpdateDeployRequestThrottlerUnauthorized extends Schema.TaggedError<UpdateDeployRequestThrottlerUnauthorized>()(
  "UpdateDeployRequestThrottlerUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.NumberFromString,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdateDeployRequestThrottlerForbidden extends Schema.TaggedError<UpdateDeployRequestThrottlerForbidden>()(
  "UpdateDeployRequestThrottlerForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    number: Schema.NumberFromString,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateDeployRequestThrottlerNotfound extends Schema.TaggedError<UpdateDeployRequestThrottlerNotfound>()(
  "UpdateDeployRequestThrottlerNotfound",
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
 * Update deploy request throttler configurations
 *
 * @param organization - The name of the deploy request's organization
 * @param database - The name of the deploy request's database
 * @param number - The number of the deploy request
 * @param ratio - A throttler ratio between 0 and 95 that will apply to all keyspaces affected by the deploy request. 0 effectively disables throttler, while 95 drastically slows down migrations in the deploy request
 * @param configurations - If specifying throttler ratios per keyspace, an array of { "keyspace_name": "mykeyspace", "ratio": 10 }, one for each eligible keyspace
 */
export const updateDeployRequestThrottler = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateDeployRequestThrottlerInput,
  outputSchema: UpdateDeployRequestThrottlerOutput,
  errors: [UpdateDeployRequestThrottlerUnauthorized, UpdateDeployRequestThrottlerForbidden, UpdateDeployRequestThrottlerNotfound],
}));
