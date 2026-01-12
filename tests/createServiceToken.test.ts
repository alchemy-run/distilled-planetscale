import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  createServiceToken,
  CreateServiceTokenNotfound,
  CreateServiceTokenInput,
  CreateServiceTokenOutput,
} from "../src/operations/createServiceToken";
import { deleteServiceToken } from "../src/operations/deleteServiceToken";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("createServiceToken", () => {
  it("should have the correct input schema", () => {
    expect(CreateServiceTokenInput.fields.organization).toBeDefined();
    expect(CreateServiceTokenInput.fields.name).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateServiceTokenOutput.fields.id).toBeDefined();
    expect(CreateServiceTokenOutput.fields.name).toBeDefined();
    expect(CreateServiceTokenOutput.fields.display_name).toBeDefined();
    expect(CreateServiceTokenOutput.fields.token).toBeDefined();
    expect(CreateServiceTokenOutput.fields.plain_text_refresh_token).toBeDefined();
    expect(CreateServiceTokenOutput.fields.avatar_url).toBeDefined();
    expect(CreateServiceTokenOutput.fields.created_at).toBeDefined();
    expect(CreateServiceTokenOutput.fields.updated_at).toBeDefined();
    expect(CreateServiceTokenOutput.fields.expires_at).toBeDefined();
    expect(CreateServiceTokenOutput.fields.last_used_at).toBeDefined();
    expect(CreateServiceTokenOutput.fields.actor_id).toBeDefined();
    expect(CreateServiceTokenOutput.fields.actor_display_name).toBeDefined();
    expect(CreateServiceTokenOutput.fields.actor_type).toBeDefined();
    expect(CreateServiceTokenOutput.fields.service_token_accesses).toBeDefined();
    expect(CreateServiceTokenOutput.fields.oauth_accesses_by_resource).toBeDefined();
  });

  it.effect("should return CreateServiceTokenNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createServiceToken({
        organization: "this-org-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateServiceTokenNotfound);
      if (result instanceof CreateServiceTokenNotfound) {
        expect(result._tag).toBe("CreateServiceTokenNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because creating service tokens requires admin permissions
  // that service tokens typically don't have. When enabled with proper credentials, it
  // demonstrates proper cleanup.
  it.skip("should create a service token successfully and clean up", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const testTokenName = `test-token-${Date.now()}`;

      const result = yield* createServiceToken({
        organization,
        name: testTokenName,
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("plain_text_refresh_token");
      expect(result).toHaveProperty("created_at");
      expect(result).toHaveProperty("service_token_accesses");
      expect(result).toHaveProperty("oauth_accesses_by_resource");

      return result;
    }).pipe(
      Effect.tap((result) =>
        Effect.gen(function* () {
          const { organization } = yield* PlanetScaleCredentials;
          yield* deleteServiceToken({
            organization,
            id: result.id,
          }).pipe(Effect.ignore);
        }),
      ),
      Effect.provide(MainLayer),
    ),
  );
});
