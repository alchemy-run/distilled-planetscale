import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  listDatabases,
  ListDatabasesNotfound,
} from "../src/operations/listDatabases";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("listDatabases", () => {
  it.effect("should list databases successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listDatabases({ organization });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(Array.isArray(result.data)).toBe(true);
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should support pagination parameters", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listDatabases({
        organization,
        page: 1,
        per_page: 5,
      });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListDatabasesNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listDatabases({
        organization: "this-org-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDatabasesNotfound);
      if (result instanceof ListDatabasesNotfound) {
        expect(result._tag).toBe("ListDatabasesNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
