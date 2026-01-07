import { FetchHttpClient } from "@effect/platform";
import { Effect, Layer } from "effect";
import { describe, it, expect } from "@effect/vitest";
import {
  getOrganization,
  OrganizationNotFound,
  PlanetScaleCredentials,
  PlanetScaleCredentialsLive,
} from "../index";

const TestLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("getOrganization", () => {
  it.effect("returns a successful response", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const org = yield* getOrganization({ name: organization });
      return org;
    }).pipe(Effect.provide(TestLayer)),
  );

  it.effect("returns OrganizationNotFound for non-existent org", () =>
    Effect.gen(function* () {
      const result = yield* getOrganization({
        name: "this-org-does-not-exist-12345",
      }).pipe(Effect.flip);

      console.log("Error:", result);
      console.log("Error tag:", result._tag);

      expect(result).toBeInstanceOf(OrganizationNotFound);
      expect(result._tag).toBe("OrganizationNotFound");
    }).pipe(Effect.provide(TestLayer)),
  );
});
