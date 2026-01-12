import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  createOauthToken,
  CreateOauthTokenNotfound,
  CreateOauthTokenInput,
  CreateOauthTokenOutput,
} from "../src/operations/createOauthToken";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("createOauthToken", () => {
  it("should have the correct input schema", () => {
    expect(CreateOauthTokenInput.fields.organization).toBeDefined();
    expect(CreateOauthTokenInput.fields.id).toBeDefined();
    expect(CreateOauthTokenInput.fields.client_id).toBeDefined();
    expect(CreateOauthTokenInput.fields.client_secret).toBeDefined();
    expect(CreateOauthTokenInput.fields.grant_type).toBeDefined();
    expect(CreateOauthTokenInput.fields.code).toBeDefined();
    expect(CreateOauthTokenInput.fields.redirect_uri).toBeDefined();
    expect(CreateOauthTokenInput.fields.refresh_token).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateOauthTokenOutput.fields.id).toBeDefined();
    expect(CreateOauthTokenOutput.fields.name).toBeDefined();
    expect(CreateOauthTokenOutput.fields.token).toBeDefined();
    expect(CreateOauthTokenOutput.fields.plain_text_refresh_token).toBeDefined();
    expect(CreateOauthTokenOutput.fields.expires_at).toBeDefined();
    expect(CreateOauthTokenOutput.fields.created_at).toBeDefined();
    expect(CreateOauthTokenOutput.fields.updated_at).toBeDefined();
    expect(CreateOauthTokenOutput.fields.service_token_accesses).toBeDefined();
    expect(CreateOauthTokenOutput.fields.oauth_accesses_by_resource).toBeDefined();
  });

  it.effect("should return CreateOauthTokenNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createOauthToken({
        organization: "this-org-definitely-does-not-exist-12345",
        id: "fake-oauth-app-id",
        client_id: "fake-client-id",
        client_secret: "fake-client-secret",
        grant_type: "authorization_code",
        code: "fake-code",
        redirect_uri: "https://example.com/callback",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateOauthTokenNotfound);
      if (result instanceof CreateOauthTokenNotfound) {
        expect(result._tag).toBe("CreateOauthTokenNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CreateOauthTokenNotfound for non-existent OAuth application", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* createOauthToken({
        organization,
        id: "this-oauth-app-definitely-does-not-exist-12345",
        client_id: "fake-client-id",
        client_secret: "fake-client-secret",
        grant_type: "authorization_code",
        code: "fake-code",
        redirect_uri: "https://example.com/callback",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateOauthTokenNotfound);
      if (result instanceof CreateOauthTokenNotfound) {
        expect(result._tag).toBe("CreateOauthTokenNotfound");
        expect(result.organization).toBe(organization);
        expect(result.id).toBe("this-oauth-app-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
