import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  deleteWebhook,
  DeleteWebhookNotfound,
  DeleteWebhookInput,
  DeleteWebhookOutput,
} from "../src/operations/deleteWebhook";
import { createWebhook } from "../src/operations/createWebhook";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("deleteWebhook", () => {
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

      expect(result).toBeInstanceOf(DeleteWebhookNotfound);
      if (result instanceof DeleteWebhookNotfound) {
        expect(result._tag).toBe("DeleteWebhookNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
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

      expect(result).toBeInstanceOf(DeleteWebhookNotfound);
      if (result instanceof DeleteWebhookNotfound) {
        expect(result._tag).toBe("DeleteWebhookNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteWebhookNotfound for non-existent webhook id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* deleteWebhook({
        organization,
        database: "test",
        id: "non-existent-webhook-id-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteWebhookNotfound);
      if (result instanceof DeleteWebhookNotfound) {
        expect(result._tag).toBe("DeleteWebhookNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("test");
        expect(result.id).toBe("non-existent-webhook-id-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test creates a webhook and then deletes it.
  // It requires a valid database to exist.
  it.skip("should delete a webhook successfully", () => {
    const database = "test";

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
      });

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

      expect(secondDelete).toBeInstanceOf(DeleteWebhookNotfound);
    }).pipe(Effect.provide(MainLayer));
  });
});
