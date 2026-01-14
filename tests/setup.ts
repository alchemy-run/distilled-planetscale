import { FetchHttpClient } from "@effect/platform";
import { layer } from "@effect/vitest";
import { Layer } from "effect";
import { config } from "dotenv";
import { CredentialsFromEnv } from "../src/credentials";

config();

const MainLayer = Layer.merge(CredentialsFromEnv, FetchHttpClient.layer);

export const withMainLayer = layer(MainLayer);

/**
 * Test database name - tests that need a database should use this
 * Set PLANETSCALE_TEST_DATABASE env var, or defaults to "database"
 */
export const TEST_DATABASE = process.env.PLANETSCALE_TEST_DATABASE || "database";
