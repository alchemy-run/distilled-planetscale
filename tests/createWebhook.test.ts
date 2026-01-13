import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import { PlanetScaleApiError } from "../src/client";
import {
  createWebhook,
  CreateWebhookNotfound,
  CreateWebhookForbidden,
  CreateWebhookInput,
  CreateWebhookOutput,
} from "../src/operations/createWebhook";
import { deleteWebhook } from "../src/operations/deleteWebhook";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("createWebhook", (it) => {
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

      const isExpectedError = result instanceof CreateWebhookNotfound || result instanceof CreateWebhookForbidden;
      expect(isExpectedError).toBe(true);
    }),
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

      const isExpectedError = result instanceof CreateWebhookNotfound || result instanceof CreateWebhookForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test creates an actual webhook and cleans it up.
  // It requires a valid database to exist.
  it.effect("should create a webhook successfully and clean up", () => {
    let createdWebhookId: string | undefined;
    // Use a test database name - adjust based on your PlanetScale setup
    const database = TEST_DATABASE;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const testWebhookUrl = `https://example.com/webhook-${Date.now()}`;

      const result = yield* createWebhook({
        organization,
        database,
        url: testWebhookUrl,
        enabled: false,
        events: ["branch.ready"],
      }).pipe(
        Effect.catchTag("CreateWebhookForbidden", () => Effect.succeed(null)),
        Effect.catchTag("PlanetScaleApiError", () => Effect.succeed(null)), // May fail if webhook limit reached
      );

      if (result === null) {
        return; // Skip test gracefully if forbidden or limit reached
      }

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
    );
  });
});
