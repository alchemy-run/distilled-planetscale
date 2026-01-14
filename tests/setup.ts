import { FetchHttpClient } from "@effect/platform";
import { layer } from "@effect/vitest";
import { config } from "dotenv";
import { Layer } from "effect";
import { CredentialsFromEnv } from "../src/credentials";

// Load environment variables from .env file
config();

// Main layer providing credentials and HTTP client for all tests
const MainLayer = Layer.merge(CredentialsFromEnv, FetchHttpClient.layer);

// Export withMainLayer helper for tests
export const withMainLayer = layer(MainLayer);
