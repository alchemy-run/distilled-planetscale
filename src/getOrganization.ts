import {
  HttpClient,
  HttpClientError,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Effect, Schema } from "effect";
import { API_BASE_URL, PlanetScaleCredentials } from "./credentials";

// Input Schema
export const GetOrganizationInput = Schema.Struct({
  name: Schema.String,
});
export type GetOrganizationInput = typeof GetOrganizationInput.Type;

// Output Schema
export const Organization = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  billing_email: Schema.optional(Schema.String),
  created_at: Schema.String,
  updated_at: Schema.String,
  plan: Schema.optional(Schema.String),
  valid_billing_info: Schema.optional(Schema.Boolean),
  sso: Schema.optional(Schema.Boolean),
  sso_directory: Schema.optional(Schema.Boolean),
  single_tenancy: Schema.optional(Schema.Boolean),
  managed_tenancy: Schema.optional(Schema.Boolean),
  has_past_due_invoices: Schema.optional(Schema.Boolean),
  database_count: Schema.optional(Schema.Number),
  sso_portal_url: Schema.optional(Schema.String),
  features: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  idp_managed_roles: Schema.optional(Schema.Boolean),
  invoice_budget_amount: Schema.optional(Schema.Union(Schema.Number, Schema.NumberFromString)),
  keyspace_shard_limit: Schema.optional(Schema.Number),
  has_card: Schema.optional(Schema.Boolean),
  payment_info_required: Schema.optional(Schema.Boolean),
});
export type Organization = typeof Organization.Type;

// API Error Response Schema - parse just the code, keep the rest as unknown
const ApiErrorResponse = Schema.Struct({
  code: Schema.String,
});
type ApiErrorResponse = typeof ApiErrorResponse.Type;

// Error code annotation symbol
export const ApiErrorCode = Symbol.for("planetscale/ApiErrorCode");

// Error Schemas
export class OrganizationNotFound extends Schema.TaggedError<OrganizationNotFound>()(
  "OrganizationNotFound",
  {
    name: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

export class PlanetScaleApiError extends Schema.TaggedError<PlanetScaleApiError>()(
  "PlanetScaleApiError",
  {
    body: Schema.Unknown,
  },
) {}

// Error matcher that uses annotations
const getOrganizationErrors = [OrganizationNotFound] as const;

type GetOrganizationErrors = InstanceType<(typeof getOrganizationErrors)[number]>;

// Helper to get the API error code from a TaggedError class
const getErrorCode = (ErrorClass: typeof OrganizationNotFound): string | undefined => {
  const ast = ErrorClass.ast;
  // TaggedError creates a Transformation, the annotation is on the 'to' node
  if (ast._tag === "Transformation") {
    return ast.to.annotations[ApiErrorCode] as string | undefined;
  }
  return ast.annotations[ApiErrorCode] as string | undefined;
};

const matchApiError = (
  input: GetOrganizationInput,
  errorBody: unknown,
): Effect.Effect<never, GetOrganizationErrors | PlanetScaleApiError> => {
  const parsed = Schema.decodeUnknownSync(ApiErrorResponse)(errorBody);
  for (const ErrorClass of getOrganizationErrors) {
    const code = getErrorCode(ErrorClass);
    if (code === parsed.code) {
      return Effect.fail(
        new ErrorClass({
          name: input.name,
          message: (errorBody as { message?: string }).message ?? "",
        }),
      );
    }
  }
  return Effect.fail(new PlanetScaleApiError({ body: errorBody }));
};

// Schema parse error wrapper
export class PlanetScaleParseError extends Schema.TaggedError<PlanetScaleParseError>()(
  "PlanetScaleParseError",
  {
    body: Schema.Unknown,
    cause: Schema.Unknown,
  },
) {}

// The effect function
export const getOrganization = (
  input: GetOrganizationInput,
): Effect.Effect<
  Organization,
  | OrganizationNotFound
  | PlanetScaleApiError
  | PlanetScaleParseError
  | HttpClientError.HttpClientError,
  PlanetScaleCredentials | HttpClient.HttpClient
> =>
  Effect.gen(function* () {
    const { token } = yield* PlanetScaleCredentials;
    const client = yield* HttpClient.HttpClient;

    const response = yield* HttpClientRequest.get(
      `${API_BASE_URL}/organizations/${input.name}`,
    ).pipe(
      HttpClientRequest.setHeader("Authorization", token),
      HttpClientRequest.setHeader("Content-Type", "application/json"),
      client.execute,
      Effect.scoped,
    );

    if (response.status >= 400) {
      const errorBody = yield* response.json;
      return yield* matchApiError(input, errorBody);
    }

    const body = yield* response.json;
    return yield* Schema.decodeUnknown(Organization)(body).pipe(
      Effect.catchTag("ParseError", (cause) =>
        Effect.fail(new PlanetScaleParseError({ body, cause })),
      ),
    );
  });
