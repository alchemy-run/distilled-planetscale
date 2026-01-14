import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const ListClusterSizeSkusInput = Schema.Struct({
  organization: Schema.String,
  engine: Schema.optional(Schema.Literal("mysql", "postgresql")),
  rates: Schema.optional(Schema.Boolean),
  region: Schema.optional(Schema.String),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}/cluster-size-skus`,
  [ApiPathParams]: ["organization"] as const,
});
export type ListClusterSizeSkusInput = typeof ListClusterSizeSkusInput.Type;

// Output Schema
export const ListClusterSizeSkusOutput = Schema.Array(Schema.Struct({
  name: Schema.String,
  display_name: Schema.String,
  cpu: Schema.String,
  storage: Schema.optional(Schema.NullOr(Schema.Number)),
  ram: Schema.Number,
  metal: Schema.Boolean,
  enabled: Schema.Boolean,
  provider: Schema.optional(Schema.NullOr(Schema.String)),
  default_vtgate: Schema.String,
  default_vtgate_rate: Schema.optional(Schema.NullOr(Schema.Number)),
  replica_rate: Schema.optional(Schema.NullOr(Schema.Number)),
  rate: Schema.optional(Schema.NullOr(Schema.Number)),
  sort_order: Schema.Number,
  architecture: Schema.optional(Schema.NullOr(Schema.String)),
  development: Schema.Boolean,
  production: Schema.Boolean,
}));
export type ListClusterSizeSkusOutput = typeof ListClusterSizeSkusOutput.Type;

// Error Schemas
export class ListClusterSizeSkusUnauthorized extends Schema.TaggedError<ListClusterSizeSkusUnauthorized>()(
  "ListClusterSizeSkusUnauthorized",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListClusterSizeSkusForbidden extends Schema.TaggedError<ListClusterSizeSkusForbidden>()(
  "ListClusterSizeSkusForbidden",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListClusterSizeSkusNotfound extends Schema.TaggedError<ListClusterSizeSkusNotfound>()(
  "ListClusterSizeSkusNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * List available cluster sizes
 *
 * List available cluster sizes for an organization
 *
 * @param organization - The name of the organization
 * @param engine - The database engine to filter by. Defaults to 'mysql'.
 * @param rates - Whether to include pricing rates in the response. Defaults to false.
 * @param region - The region slug to get rates for. If not specified, uses the organization's default region.
 */
export const listClusterSizeSkus = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListClusterSizeSkusInput,
  outputSchema: ListClusterSizeSkusOutput,
  errors: [ListClusterSizeSkusUnauthorized, ListClusterSizeSkusForbidden, ListClusterSizeSkusNotfound],
}));
