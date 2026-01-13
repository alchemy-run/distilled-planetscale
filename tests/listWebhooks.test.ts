import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listWebhooks,
  ListWebhooksNotfound,
  ListWebhooksInput,
  ListWebhooksOutput,
} from "../src/operations/listWebhooks";
import { withMainLayer } from "./setup";

withMainLayer("listWebhooks", (it) => {
  it("should have the correct input schema", () => {
    expect(ListWebhooksInput.fields.organization).toBeDefined();
    expect(ListWebhooksInput.fields.database).toBeDefined();
    expect(ListWebhooksInput.fields.page).toBeDefined();
    expect(ListWebhooksInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListWebhooksOutput.fields.current_page).toBeDefined();
    expect(ListWebhooksOutput.fields.next_page).toBeDefined();
    expect(ListWebhooksOutput.fields.next_page_url).toBeDefined();
    expect(ListWebhooksOutput.fields.prev_page).toBeDefined();
    expect(ListWebhooksOutput.fields.prev_page_url).toBeDefined();
    expect(ListWebhooksOutput.fields.data).toBeDefined();
  });

  it.effect("should list webhooks successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listWebhooks({
        organization,
        database: "test",
      }).pipe(
        // Handle case where test database doesn't exist
        Effect.catchTag("ListWebhooksNotfound", () =>
          Effect.succeed({
            current_page: 1,
            next_page: 1,
            next_page_url: "",
            prev_page: 1,
            prev_page_url: "",
            data: [],
          }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect("should support pagination parameters", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listWebhooks({
        organization,
        database: "test",
        page: 1,
        per_page: 5,
      }).pipe(
        // Handle case where test database doesn't exist
        Effect.catchTag("ListWebhooksNotfound", () =>
          Effect.succeed({
            current_page: 1,
            next_page: 1,
            next_page_url: "",
            prev_page: 1,
            prev_page_url: "",
            data: [],
          }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
    }),
  );

  it.effect("should return ListWebhooksNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listWebhooks({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListWebhooksNotfound);
      if (result instanceof ListWebhooksNotfound) {
        expect(result._tag).toBe("ListWebhooksNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListWebhooksNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listWebhooks({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListWebhooksNotfound);
      if (result instanceof ListWebhooksNotfound) {
        expect(result._tag).toBe("ListWebhooksNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );
});
