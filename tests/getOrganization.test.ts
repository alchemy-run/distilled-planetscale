import { Effect } from "effect";
import { describe, it } from "@effect/vitest";
import {
  getOrganization,
  GetOrganizationInput,
  PlanetScaleCredentials,
  PlanetScaleCredentialsLive,
} from "../index";

describe("getOrganization", () => {
  it.effect("returns a successful response", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const org = yield* getOrganization(
        new GetOrganizationInput({ name: organization }),
      );
      return org;
    }).pipe(Effect.provide(PlanetScaleCredentialsLive)),
  );
});
