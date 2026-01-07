import { Effect } from "effect";
import { describe, it } from "@effect/vitest";
import {
  getOrganization,
  listDatabases,
  PlanetScaleCredentialsLive,
} from "../src/client";

describe("PlanetScale Client", () => {
  it.effect("getOrganization returns a successful response", () =>
    Effect.gen(function* () {
      const org = yield* getOrganization;
      return org;
    }).pipe(Effect.provide(PlanetScaleCredentialsLive)),
  );

  it.effect("listDatabases returns a successful response", () =>
    Effect.gen(function* () {
      const databases = yield* listDatabases;
      return databases;
    }).pipe(Effect.provide(PlanetScaleCredentialsLive)),
  );
});
