import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  listDeployRequestReviews,
  ListDeployRequestReviewsNotfound,
  ListDeployRequestReviewsInput,
  ListDeployRequestReviewsOutput,
} from "../src/operations/listDeployRequestReviews";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("listDeployRequestReviews", () => {
  it("should have the correct input schema", () => {
    expect(ListDeployRequestReviewsInput.fields.organization).toBeDefined();
    expect(ListDeployRequestReviewsInput.fields.database).toBeDefined();
    expect(ListDeployRequestReviewsInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListDeployRequestReviewsOutput.fields.current_page).toBeDefined();
    expect(ListDeployRequestReviewsOutput.fields.next_page).toBeDefined();
    expect(ListDeployRequestReviewsOutput.fields.next_page_url).toBeDefined();
    expect(ListDeployRequestReviewsOutput.fields.prev_page).toBeDefined();
    expect(ListDeployRequestReviewsOutput.fields.prev_page_url).toBeDefined();
    expect(ListDeployRequestReviewsOutput.fields.data).toBeDefined();
  });

  it.effect("should return ListDeployRequestReviewsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listDeployRequestReviews({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDeployRequestReviewsNotfound);
      if (result instanceof ListDeployRequestReviewsNotfound) {
        expect(result._tag).toBe("ListDeployRequestReviewsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListDeployRequestReviewsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listDeployRequestReviews({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDeployRequestReviewsNotfound);
      if (result instanceof ListDeployRequestReviewsNotfound) {
        expect(result._tag).toBe("ListDeployRequestReviewsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListDeployRequestReviewsNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* listDeployRequestReviews({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDeployRequestReviewsNotfound);
      if (result instanceof ListDeployRequestReviewsNotfound) {
        expect(result._tag).toBe("ListDeployRequestReviewsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
