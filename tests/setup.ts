import { FetchHttpClient } from "@effect/platform";
import { layer } from "@effect/vitest";
import { Layer } from "effect";
import { config } from "dotenv";
import { PlanetScaleCredentialsFromEnv } from "../src/credentials";

config();

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

export const withMainLayer = layer(MainLayer);
