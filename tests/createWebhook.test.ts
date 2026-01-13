import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  createWebhook,
  CreateWebhookNotfound,
  CreateWebhookInput,
  CreateWebhookOutput,
} from "../src/operations/createWebhook";
import { deleteWebhook } from "../src/operations/deleteWebhook";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("createWebhook", () => {
  it("should have the correct input schema", () => {
    expect(CreateWebhookInput.fields.organization).toBeDefined();
    expect(CreateWebhookInput.fields.database).toBeDefined();
    expect(CreateWebhookInput.fields.url).toBeDefined();
    expect(CreateWebhookInput.fields.enabled).toBeDefined();
    expect(CreateWebhookInput.fields.events).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateWebhookOutput.fields.id).toBeDefined();
    expect(CreateWebhookOutput.fields.url).toBeDefined();
    expect(CreateWebhookOutput.fields.secret).toBeDefined();
    expect(CreateWebhookOutput.fields.enabled).toBeDefined();
    expect(CreateWebhookOutput.fields.last_sent_result).toBeDefined();
    expect(CreateWebhookOutput.fields.last_sent_success).toBeDefined();
    expect(CreateWebhookOutput.fields.last_sent_at).toBeDefined();
    expect(CreateWebhookOutput.fields.created_at).toBeDefined();
    expect(CreateWebhookOutput.fields.updated_at).toBeDefined();
    expect(CreateWebhookOutput.fields.events).toBeDefined();
  });

  it.effect("should return CreateWebhookNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createWebhook({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        url: "https://example.com/webhook",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateWebhookNotfound);
      if (result instanceof CreateWebhookNotfound) {
        expect(result._tag).toBe("CreateWebhookNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CreateWebhookNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* createWebhook({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        url: "https://example.com/webhook",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateWebhookNotfound);
      if (result instanceof CreateWebhookNotfound) {
        expect(result._tag).toBe("CreateWebhookNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test creates an actual webhook and cleans it up.
  // It requires a valid database to exist.
  it.skip("should create a webhook successfully and clean up", () => {
    let createdWebhookId: string | undefined;
    // Use a test database name - adjust based on your PlanetScale setup
    const database = "test";

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const testWebhookUrl = `https://example.com/webhook-${Date.now()}`;

      const result = yield* createWebhook({
        organization,
        database,
        url: testWebhookUrl,
        enabled: false,
        events: ["branch.ready"],
      });

      createdWebhookId = result.id;

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("url", testWebhookUrl);
      expect(result).toHaveProperty("secret");
      expect(result).toHaveProperty("enabled", false);
      expect(result).toHaveProperty("events");
      expect(result.events).toContain("branch.ready");
      expect(result).toHaveProperty("created_at");
      expect(result).toHaveProperty("updated_at");
    }).pipe(
      Effect.ensuring(
        Effect.gen(function* () {
          if (createdWebhookId) {
            const { organization } = yield* PlanetScaleCredentials;
            yield* deleteWebhook({
              organization,
              database,
              id: createdWebhookId,
            }).pipe(Effect.ignore);
          }
        }),
      ),
      Effect.provide(MainLayer),
    );
  });
});
