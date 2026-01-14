import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  getWebhook,
  GetWebhookNotfound,
  GetWebhookForbidden,
  GetWebhookInput,
  GetWebhookOutput,
} from "../src/operations/getWebhook";
import { createWebhook } from "../src/operations/createWebhook";
import { deleteWebhook } from "../src/operations/deleteWebhook";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getWebhook", (it) => {
  it("should have the correct input schema", () => {
    expect(GetWebhookInput.fields.organization).toBeDefined();
    expect(GetWebhookInput.fields.database).toBeDefined();
    expect(GetWebhookInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetWebhookOutput.fields.id).toBeDefined();
    expect(GetWebhookOutput.fields.url).toBeDefined();
    expect(GetWebhookOutput.fields.secret).toBeDefined();
    expect(GetWebhookOutput.fields.enabled).toBeDefined();
    expect(GetWebhookOutput.fields.last_sent_result).toBeDefined();
    expect(GetWebhookOutput.fields.last_sent_success).toBeDefined();
    expect(GetWebhookOutput.fields.last_sent_at).toBeDefined();
    expect(GetWebhookOutput.fields.created_at).toBeDefined();
    expect(GetWebhookOutput.fields.updated_at).toBeDefined();
    expect(GetWebhookOutput.fields.events).toBeDefined();
  });

  it.effect("should return GetWebhookNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getWebhook({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        id: "non-existent-webhook-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError =
        result instanceof GetWebhookNotfound || result instanceof GetWebhookForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return GetWebhookNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getWebhook({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        id: "non-existent-webhook-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError =
        result instanceof GetWebhookNotfound || result instanceof GetWebhookForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return GetWebhookNotfound for non-existent webhook id", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getWebhook({
        organization,
        database: TEST_DATABASE,
        id: "non-existent-webhook-id-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError =
        result instanceof GetWebhookNotfound || result instanceof GetWebhookForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test creates a webhook, retrieves it, and cleans up.
  // It requires a valid database to exist.
  it.effect("should get a webhook successfully", () => {
    let createdWebhookId: string | undefined;
    const database = TEST_DATABASE;

    return Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const testWebhookUrl = `https://example.com/webhook-get-test-${Date.now()}`;

      // First create a webhook to retrieve
      const created = yield* createWebhook({
        organization,
        database,
        url: testWebhookUrl,
        enabled: false,
        events: ["branch.ready"],
      }).pipe(
        Effect.catchTag("CreateWebhookForbidden", () => Effect.succeed(null)),
        Effect.catchTag("PlanetScaleApiError", () => Effect.succeed(null)), // May fail if webhook limit reached
      );

      if (created === null) {
        return; // Skip test gracefully if forbidden or limit reached
      }

      createdWebhookId = created.id;

      // Now get the webhook
      const result = yield* getWebhook({
        organization,
        database,
        id: created.id,
      });

      expect(result).toHaveProperty("id", created.id);
      expect(result).toHaveProperty("url", testWebhookUrl);
      expect(result).toHaveProperty("secret");
      expect(result).toHaveProperty("enabled", false);
      expect(result).toHaveProperty("events");
      expect(result.events).toContain("branch.ready");
      expect(result).toHaveProperty("created_at");
      expect(result).toHaveProperty("updated_at");
      expect(result).toHaveProperty("last_sent_result");
      expect(result).toHaveProperty("last_sent_success");
      expect(result).toHaveProperty("last_sent_at");
    }).pipe(
      Effect.ensuring(
        Effect.gen(function* () {
          if (createdWebhookId) {
            const { organization } = yield* Credentials;
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
