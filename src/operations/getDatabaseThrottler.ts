import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const GetDatabaseThrottlerInput = Schema.Struct({
  organization: Schema.String,
  database: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; database: string }) => `/organizations/${input.organization}/databases/${input.database}/throttler`,
});
export type GetDatabaseThrottlerInput = typeof GetDatabaseThrottlerInput.Type;

// Output Schema
export const GetDatabaseThrottlerOutput = Schema.Struct({
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
export type GetDatabaseThrottlerOutput = typeof GetDatabaseThrottlerOutput.Type;

// Error Schemas
export class GetDatabaseThrottlerUnauthorized extends Schema.TaggedError<GetDatabaseThrottlerUnauthorized>()(
  "GetDatabaseThrottlerUnauthorized",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetDatabaseThrottlerForbidden extends Schema.TaggedError<GetDatabaseThrottlerForbidden>()(
  "GetDatabaseThrottlerForbidden",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetDatabaseThrottlerNotfound extends Schema.TaggedError<GetDatabaseThrottlerNotfound>()(
  "GetDatabaseThrottlerNotfound",
  {
    organization: Schema.String,
    database: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const getDatabaseThrottler = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetDatabaseThrottlerInput,
  outputSchema: GetDatabaseThrottlerOutput,
  errors: [GetDatabaseThrottlerUnauthorized, GetDatabaseThrottlerForbidden, GetDatabaseThrottlerNotfound],
}));
