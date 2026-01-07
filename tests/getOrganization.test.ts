import { FetchHttpClient } from "@effect/platform";
import { Effect, Layer } from "effect";
import { describe, it } from "@effect/vitest";
import {
  getOrganization,
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
});
