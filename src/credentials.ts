import { Context, Effect, Layer } from "effect";
import { ConfigError } from "./errors";

export const API_BASE_URL = "https://api.planetscale.com/v1";

export interface PlanetScaleCredentialsService {
  readonly token: string;
  readonly organization: string;
}

export class PlanetScaleCredentials extends Context.Tag("PlanetScaleCredentials")<
  PlanetScaleCredentials,
  PlanetScaleCredentialsService
>() {}

export const PlanetScaleCredentialsLive = Layer.effect(
  PlanetScaleCredentials,
  Effect.gen(function* () {
    const token = process.env.PLANETSCALE_API_TOKEN;
    const organization = process.env.PLANETSCALE_ORGANIZATION;

    if (!token) {
      return yield* new ConfigError({
        message: "PLANETSCALE_API_TOKEN environment variable is required",
      });
    }

    if (!organization) {
      return yield* new ConfigError({
        message: "PLANETSCALE_ORGANIZATION environment variable is required",
      });
    }

    return { token, organization };
  }),
);
