import { Effect } from "effect";
import { describe, it } from "@effect/vitest";
import { listDatabases, PlanetScaleCredentialsLive } from "../index";

describe("listDatabases", () => {
  it.effect("returns a successful response", () =>
    Effect.gen(function* () {
      const databases = yield* listDatabases;
      return databases;
    }).pipe(Effect.provide(PlanetScaleCredentialsLive)),
  );
});
