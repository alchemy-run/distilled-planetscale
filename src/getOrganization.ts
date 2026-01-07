import { Effect, Schema } from "effect";
import { API_BASE_URL, PlanetScaleCredentials } from "./credentials";

// Input Schema
export class GetOrganizationInput extends Schema.Class<GetOrganizationInput>(
  "GetOrganizationInput",
)({
  name: Schema.String,
}) {}

// Output Schema
export class Organization extends Schema.Class<Organization>("Organization")({
  id: Schema.String,
  name: Schema.String,
  billing_email: Schema.optionalWith(Schema.String, { as: "Option" }),
  created_at: Schema.String,
  updated_at: Schema.String,
  plan: Schema.optionalWith(Schema.String, { as: "Option" }),
  valid_billing_info: Schema.optionalWith(Schema.Boolean, { as: "Option" }),
  sso: Schema.optionalWith(Schema.Boolean, { as: "Option" }),
  sso_directory: Schema.optionalWith(Schema.Boolean, { as: "Option" }),
  single_tenancy: Schema.optionalWith(Schema.Boolean, { as: "Option" }),
  managed_tenancy: Schema.optionalWith(Schema.Boolean, { as: "Option" }),
  has_past_due_invoices: Schema.optionalWith(Schema.Boolean, { as: "Option" }),
  database_count: Schema.optionalWith(Schema.Number, { as: "Option" }),
  sso_portal_url: Schema.optionalWith(Schema.String, { as: "Option" }),
  features: Schema.optionalWith(
    Schema.Record({ key: Schema.String, value: Schema.Unknown }),
    { as: "Option" },
  ),
  idp_managed_roles: Schema.optionalWith(Schema.Boolean, { as: "Option" }),
  invoice_budget_amount: Schema.optionalWith(
    Schema.Union(Schema.Number, Schema.NumberFromString),
    { as: "Option" },
  ),
  keyspace_shard_limit: Schema.optionalWith(Schema.Number, { as: "Option" }),
  has_card: Schema.optionalWith(Schema.Boolean, { as: "Option" }),
  payment_info_required: Schema.optionalWith(Schema.Boolean, { as: "Option" }),
}) {}

// Error Schemas
export class NetworkError extends Schema.TaggedError<NetworkError>()(
  "NetworkError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  },
) {}

export class HttpError extends Schema.TaggedError<HttpError>()("HttpError", {
  message: Schema.String,
  status: Schema.Number,
}) {}

export class ParseError extends Schema.TaggedError<ParseError>()("ParseError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
}) {}

// All possible errors for this endpoint
export type GetOrganizationError = NetworkError | HttpError | ParseError;

// The effect function
export const getOrganization = (
  input: GetOrganizationInput,
): Effect.Effect<
  Organization,
  GetOrganizationError,
  PlanetScaleCredentials
> =>
  Effect.gen(function* () {
    const { token } = yield* PlanetScaleCredentials;

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(`${API_BASE_URL}/organizations/${input.name}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }),
      catch: (error) =>
        new NetworkError({
          message: `Network error fetching organization`,
          cause: error,
        }),
    });

    if (!response.ok) {
      return yield* new HttpError({
        message: `Failed to get organization: ${response.statusText}`,
        status: response.status,
      });
    }

    const json = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) =>
        new ParseError({
          message: "Failed to parse organization response as JSON",
          cause: error,
        }),
    });

    return yield* Schema.decodeUnknown(Organization)(json).pipe(
      Effect.mapError(
        (error) =>
          new ParseError({
            message: "Failed to decode organization response",
            cause: error,
          }),
      ),
    );
  });
