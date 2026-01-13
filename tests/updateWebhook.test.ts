import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  updateWebhook,
  UpdateWebhookNotfound,
  UpdateWebhookInput,
  UpdateWebhookOutput,
} from "../src/operations/updateWebhook";
import { createWebhook } from "../src/operations/createWebhook";
import { deleteWebhook } from "../src/operations/deleteWebhook";
import { withMainLayer } from "./setup";

withMainLayer("updateWebhook", (it) => {
  it("should have the correct input schema", () => {
    expect(UpdateWebhookInput.fields.organization).toBeDefined();
    expect(UpdateWebhookInput.fields.database).toBeDefined();
    expect(UpdateWebhookInput.fields.id).toBeDefined();
    expect(UpdateWebhookInput.fields.url).toBeDefined();
    expect(UpdateWebhookInput.fields.enabled).toBeDefined();
    expect(UpdateWebhookInput.fields.events).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateWebhookOutput.fields.id).toBeDefined();
    expect(UpdateWebhookOutput.fields.url).toBeDefined();
    expect(UpdateWebhookOutput.fields.secret).toBeDefined();
    expect(UpdateWebhookOutput.fields.enabled).toBeDefined();
    expect(UpdateWebhookOutput.fields.last_sent_result).toBeDefined();
    expect(UpdateWebhookOutput.fields.last_sent_success).toBeDefined();
    expect(UpdateWebhookOutput.fields.last_sent_at).toBeDefined();
    expect(UpdateWebhookOutput.fields.created_at).toBeDefined();
    expect(UpdateWebhookOutput.fields.updated_at).toBeDefined();
    expect(UpdateWebhookOutput.fields.events).toBeDefined();
  });

  it.effect("should return UpdateWebhookNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateWebhook({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        id: "non-existent-webhook-id",
        enabled: false,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateWebhookNotfound);
      if (result instanceof UpdateWebhookNotfound) {
        expect(result._tag).toBe("UpdateWebhookNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateWebhookNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateWebhook({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        id: "non-existent-webhook-id",
        enabled: false,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateWebhookNotfound);
      if (result instanceof UpdateWebhookNotfound) {
        expect(result._tag).toBe("UpdateWebhookNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateWebhookNotfound for non-existent webhook id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateWebhook({
        organization,
        database: "test",
        id: "non-existent-webhook-id-12345",
        enabled: false,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateWebhookNotfound);
      if (result instanceof UpdateWebhookNotfound) {
        expect(result._tag).toBe("UpdateWebhookNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("test");
        expect(result.id).toBe("non-existent-webhook-id-12345");
      }
    }),
  );

  // Note: This test creates a webhook, updates it, and cleans up.
  // It requires a valid database to exist.
  it.skip("should update a webhook successfully", () => {
    let createdWebhookId: string | undefined;
    const database = "test";

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const testWebhookUrl = `https://example.com/webhook-update-test-${Date.now()}`;

      // First create a webhook to update
      const created = yield* createWebhook({
        organization,
        database,
        url: testWebhookUrl,
        enabled: false,
        events: ["branch.ready"],
      });

      createdWebhookId = created.id;

      expect(created).toHaveProperty("id");
      expect(created).toHaveProperty("enabled", false);
      expect(created.events).toContain("branch.ready");

      // Now update the webhook
      const updatedUrl = `https://example.com/webhook-updated-${Date.now()}`;
      const result = yield* updateWebhook({
        organization,
        database,
        id: created.id,
        url: updatedUrl,
        enabled: true,
        events: ["branch.ready", "branch.sleeping"],
      });

      expect(result).toHaveProperty("id", created.id);
      expect(result).toHaveProperty("url", updatedUrl);
      expect(result).toHaveProperty("secret");
      expect(result).toHaveProperty("enabled", true);
      expect(result).toHaveProperty("events");
      expect(result.events).toContain("branch.ready");
      expect(result.events).toContain("branch.sleeping");
      expect(result).toHaveProperty("created_at");
      expect(result).toHaveProperty("updated_at");
      expect(result).toHaveProperty("last_sent_result");
      expect(result).toHaveProperty("last_sent_success");
      expect(result).toHaveProperty("last_sent_at");
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
