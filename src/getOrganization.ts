import {
  HttpClient,
  HttpClientError,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Effect, ParseResult, Schema } from "effect";
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

// Error Schema
export class OrganizationNotFound extends Schema.TaggedError<OrganizationNotFound>()(
  "OrganizationNotFound",
  {
    name: Schema.String,
  },
) {}

// The effect function
export const getOrganization = (
  input: GetOrganizationInput,
): Effect.Effect<
  Organization,
  OrganizationNotFound | HttpClientError.HttpClientError | ParseResult.ParseError,
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

    if (response.status === 404) {
      return yield* new OrganizationNotFound({ name: input.name });
    }

    return yield* HttpClientResponse.schemaBodyJson(Organization)(response);
  });
