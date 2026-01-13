import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  getOauthToken,
  GetOauthTokenForbidden,
  GetOauthTokenInput,
  GetOauthTokenNotfound,
  GetOauthTokenOutput,
} from "../src/operations/getOauthToken";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("getOauthToken", () => {
  it("should have the correct input schema", () => {
    expect(GetOauthTokenInput.fields.organization).toBeDefined();
    expect(GetOauthTokenInput.fields.application_id).toBeDefined();
    expect(GetOauthTokenInput.fields.token_id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetOauthTokenOutput.fields.id).toBeDefined();
    expect(GetOauthTokenOutput.fields.name).toBeDefined();
    expect(GetOauthTokenOutput.fields.display_name).toBeDefined();
    expect(GetOauthTokenOutput.fields.token).toBeDefined();
    expect(GetOauthTokenOutput.fields.plain_text_refresh_token).toBeDefined();
    expect(GetOauthTokenOutput.fields.avatar_url).toBeDefined();
    expect(GetOauthTokenOutput.fields.created_at).toBeDefined();
    expect(GetOauthTokenOutput.fields.updated_at).toBeDefined();
    expect(GetOauthTokenOutput.fields.expires_at).toBeDefined();
    expect(GetOauthTokenOutput.fields.last_used_at).toBeDefined();
    expect(GetOauthTokenOutput.fields.actor_id).toBeDefined();
    expect(GetOauthTokenOutput.fields.actor_display_name).toBeDefined();
    expect(GetOauthTokenOutput.fields.actor_type).toBeDefined();
    expect(GetOauthTokenOutput.fields.service_token_accesses).toBeDefined();
    expect(GetOauthTokenOutput.fields.oauth_accesses_by_resource).toBeDefined();
  });

  it.effect("should return GetOauthTokenForbidden for non-existent token in valid organization", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* getOauthToken({
        organization,
        application_id: "this-application-definitely-does-not-exist-12345",
        token_id: "this-token-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      // API returns forbidden when accessing an application/token that doesn't exist in your organization
      expect(result).toBeInstanceOf(GetOauthTokenForbidden);
      if (result instanceof GetOauthTokenForbidden) {
        expect(result._tag).toBe("GetOauthTokenForbidden");
        expect(result.organization).toBe(organization);
        expect(result.application_id).toBe("this-application-definitely-does-not-exist-12345");
        expect(result.token_id).toBe("this-token-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return GetOauthTokenNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getOauthToken({
        organization: "this-org-definitely-does-not-exist-12345",
        application_id: "some-application-id",
        token_id: "some-token-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetOauthTokenNotfound);
      if (result instanceof GetOauthTokenNotfound) {
        expect(result._tag).toBe("GetOauthTokenNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
        expect(result.application_id).toBe("some-application-id");
        expect(result.token_id).toBe("some-token-id");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
