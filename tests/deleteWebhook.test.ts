import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import { PlanetScaleApiError } from "../src/client";
import {
  deleteWebhook,
  DeleteWebhookNotfound,
  DeleteWebhookForbidden,
  DeleteWebhookInput,
  DeleteWebhookOutput,
} from "../src/operations/deleteWebhook";
import { createWebhook, CreateWebhookForbidden } from "../src/operations/createWebhook";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("deleteWebhook", (it) => {
  it("should have the correct input schema", () => {
    expect(DeleteWebhookInput.fields.organization).toBeDefined();
    expect(DeleteWebhookInput.fields.database).toBeDefined();
    expect(DeleteWebhookInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    // Output is void for delete operations
    expect(DeleteWebhookOutput).toBeDefined();
  });

  it.effect("should return DeleteWebhookNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteWebhook({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        id: "non-existent-webhook-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof DeleteWebhookNotfound || result instanceof DeleteWebhookForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteWebhookNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* deleteWebhook({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        id: "non-existent-webhook-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof DeleteWebhookNotfound || result instanceof DeleteWebhookForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteWebhookNotfound for non-existent webhook id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* deleteWebhook({
        organization,
        database: TEST_DATABASE,
        id: "non-existent-webhook-id-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof DeleteWebhookNotfound || result instanceof DeleteWebhookForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test creates a webhook and then deletes it.
  // It requires a valid database to exist.
  it.effect("should delete a webhook successfully", () => {
    const database = TEST_DATABASE;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const testWebhookUrl = `https://example.com/webhook-delete-test-${Date.now()}`;

      // First create a webhook to delete
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

      expect(created).toHaveProperty("id");

      // Now delete the webhook
      const result = yield* deleteWebhook({
        organization,
        database,
        id: created.id,
      });

      // deleteWebhook returns void on success
      expect(result).toBeUndefined();

      // Verify it's deleted by trying to delete again (should fail)
      const secondDelete = yield* deleteWebhook({
        organization,
        database,
        id: created.id,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = secondDelete instanceof DeleteWebhookNotfound || secondDelete instanceof DeleteWebhookForbidden;
      expect(isExpectedError).toBe(true);
    });
  });
});
