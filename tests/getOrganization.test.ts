import { Effect } from "effect";
import { describe, it } from "@effect/vitest";
import { getOrganization, PlanetScaleCredentialsLive } from "../index";

describe("getOrganization", () => {
  it.effect("returns a successful response", () =>
    Effect.gen(function* () {
      const org = yield* getOrganization;
      return org;
    }).pipe(Effect.provide(PlanetScaleCredentialsLive)),
  );
});
