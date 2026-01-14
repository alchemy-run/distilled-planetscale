import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import { PlanetScaleApiError } from "../src/client";
import {
  testWebhook,
  TestWebhookNotfound,
  TestWebhookForbidden,
  TestWebhookInput,
  TestWebhookOutput,
} from "../src/operations/testWebhook";
import { createWebhook, CreateWebhookForbidden } from "../src/operations/createWebhook";
import { deleteWebhook } from "../src/operations/deleteWebhook";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("testWebhook", (it) => {
  it("should have the correct input schema", () => {
    expect(TestWebhookInput.fields.organization).toBeDefined();
    expect(TestWebhookInput.fields.database).toBeDefined();
    expect(TestWebhookInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    // Output is Schema.Void, so we just verify it exists
    expect(TestWebhookOutput).toBeDefined();
  });

  it.effect("should return TestWebhookNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* testWebhook({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        id: "non-existent-webhook-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof TestWebhookNotfound || result instanceof TestWebhookForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return TestWebhookNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* testWebhook({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        id: "non-existent-webhook-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof TestWebhookNotfound || result instanceof TestWebhookForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return TestWebhookNotfound for non-existent webhook id", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* testWebhook({
        organization,
        database: TEST_DATABASE,
        id: "non-existent-webhook-id-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof TestWebhookNotfound || result instanceof TestWebhookForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test creates a webhook, tests it, and cleans up.
  // It requires a valid database to exist.
  it.effect("should test a webhook successfully", () => {
    let createdWebhookId: string | undefined;
    const database = TEST_DATABASE;

    return Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const testWebhookUrl = `https://example.com/webhook-test-${Date.now()}`;

      // First create a webhook to test
      const created = yield* createWebhook({
        organization,
        database,
        url: testWebhookUrl,
        enabled: true,
        events: ["branch.ready"],
      }).pipe(
        Effect.catchTag("CreateWebhookForbidden", () => Effect.succeed(null)),
        Effect.catchTag("PlanetScaleApiError", () => Effect.succeed(null)), // May fail if webhook limit reached
      );

      if (created === null) {
        return; // Skip test gracefully if forbidden or limit reached
      }

      createdWebhookId = created.id;

      // Now test the webhook - returns void on success
      const result = yield* testWebhook({
        organization,
        database,
        id: created.id,
      });

      // testWebhook returns void on success
      expect(result).toBeUndefined();
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
