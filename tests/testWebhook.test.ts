import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  testWebhook,
  TestWebhookNotfound,
  TestWebhookInput,
  TestWebhookOutput,
} from "../src/operations/testWebhook";
import { createWebhook } from "../src/operations/createWebhook";
import { deleteWebhook } from "../src/operations/deleteWebhook";
import { withMainLayer } from "./setup";

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

      expect(result).toBeInstanceOf(TestWebhookNotfound);
      if (result instanceof TestWebhookNotfound) {
        expect(result._tag).toBe("TestWebhookNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return TestWebhookNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
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

      expect(result).toBeInstanceOf(TestWebhookNotfound);
      if (result instanceof TestWebhookNotfound) {
        expect(result._tag).toBe("TestWebhookNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return TestWebhookNotfound for non-existent webhook id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* testWebhook({
        organization,
        database: "test",
        id: "non-existent-webhook-id-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(TestWebhookNotfound);
      if (result instanceof TestWebhookNotfound) {
        expect(result._tag).toBe("TestWebhookNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("test");
        expect(result.id).toBe("non-existent-webhook-id-12345");
      }
    }),
  );

  // Note: This test creates a webhook, tests it, and cleans up.
  // It requires a valid database to exist.
  it.skip("should test a webhook successfully", () => {
    let createdWebhookId: string | undefined;
    const database = "test";

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const testWebhookUrl = `https://example.com/webhook-test-${Date.now()}`;

      // First create a webhook to test
      const created = yield* createWebhook({
        organization,
        database,
        url: testWebhookUrl,
        enabled: true,
        events: ["branch.ready"],
      });

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
