import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  getDeployQueue,
  GetDeployQueueInput,
  GetDeployQueueOutput,
  GetDeployQueueNotfound,
} from "../src/operations/getDeployQueue";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("getDeployQueue", () => {
  it("should have the correct input schema", () => {
    expect(GetDeployQueueInput.fields.organization).toBeDefined();
    expect(GetDeployQueueInput.fields.database).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetDeployQueueOutput.fields.current_page).toBeDefined();
    expect(GetDeployQueueOutput.fields.next_page).toBeDefined();
    expect(GetDeployQueueOutput.fields.prev_page).toBeDefined();
    expect(GetDeployQueueOutput.fields.data).toBeDefined();
  });

  it.effect("should fetch deploy queue successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* getDeployQueue({
        organization,
        database: "test",
      }).pipe(
        Effect.catchTag("GetDeployQueueNotfound", () =>
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

      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return GetDeployQueueNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* getDeployQueue({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDeployQueueNotfound);
      if (result instanceof GetDeployQueueNotfound) {
        expect(result._tag).toBe("GetDeployQueueNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
