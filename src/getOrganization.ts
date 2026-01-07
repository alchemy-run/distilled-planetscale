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
});
export type Organization = typeof Organization.Type;

// The effect function
export const getOrganization = (
  input: GetOrganizationInput,
): Effect.Effect<
  Organization,
  HttpClientError.HttpClientError | ParseResult.ParseError,
  PlanetScaleCredentials | HttpClient.HttpClient
> =>
  Effect.gen(function* () {
    const { token } = yield* PlanetScaleCredentials;
    const client = yield* HttpClient.HttpClient;

    return yield* HttpClientRequest.get(
      `${API_BASE_URL}/organizations/${input.name}`,
    ).pipe(
      HttpClientRequest.setHeader("Authorization", token),
      HttpClientRequest.setHeader("Content-Type", "application/json"),
      client.execute,
      Effect.flatMap(HttpClientResponse.schemaBodyJson(Organization)),
      Effect.scoped,
    );
  });
