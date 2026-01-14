import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const UpdateDatabaseThrottlerInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
  ratio: Schema.optional(Schema.Number),
  configurations: Schema.optional(Schema.Array(Schema.String)),
}).annotations({
  [ApiMethod]: "PATCH",
  [ApiPath]: (input: { organization: string; database: string }) => `/organizations/${input.organization}/databases/${input.database}/throttler`,
  [ApiPathParams]: ["organization", "database"] as const,
});
export type UpdateDatabaseThrottlerInput = typeof UpdateDatabaseThrottlerInput.Type;

// Output Schema
export const UpdateDatabaseThrottlerOutput = Schema.Struct({
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
export type UpdateDatabaseThrottlerOutput = typeof UpdateDatabaseThrottlerOutput.Type;

// Error Schemas
export class UpdateDatabaseThrottlerUnauthorized extends Schema.TaggedError<UpdateDatabaseThrottlerUnauthorized>()(
  "UpdateDatabaseThrottlerUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class UpdateDatabaseThrottlerForbidden extends Schema.TaggedError<UpdateDatabaseThrottlerForbidden>()(
  "UpdateDatabaseThrottlerForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class UpdateDatabaseThrottlerNotfound extends Schema.TaggedError<UpdateDatabaseThrottlerNotfound>()(
  "UpdateDatabaseThrottlerNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Update database throttler configurations
 *
 * @param organization - The name of the organization that the throttled deploy requests belong to
 * @param database - The name of the database that the throttled deploy requests belong to
 * @param ratio - A throttler ratio between 0 and 95 that will apply to all keyspaces in the database. 0 effectively disables throttler, while 95 drastically slows down deploy request migrations
 * @param configurations - If specifying throttler ratios per keyspace, an array of { "keyspace_name": "mykeyspace", "ratio": 10 }, one for each eligible keyspace
 */
export const updateDatabaseThrottler = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: UpdateDatabaseThrottlerInput,
  outputSchema: UpdateDatabaseThrottlerOutput,
  errors: [UpdateDatabaseThrottlerUnauthorized, UpdateDatabaseThrottlerForbidden, UpdateDatabaseThrottlerNotfound],
}));
