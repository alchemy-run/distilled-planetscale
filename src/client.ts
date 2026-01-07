import { Context, Data, Effect, Layer } from "effect";

const API_BASE_URL = "https://api.planetscale.com/v1";

// Credentials service
interface PlanetScaleCredentialsService {
  readonly token: string;
  readonly organization: string;
}

class PlanetScaleCredentials extends Context.Tag("PlanetScaleCredentials")<
  PlanetScaleCredentials,
  PlanetScaleCredentialsService
>() {}

// Errors
class PlanetScaleError extends Data.TaggedError("PlanetScaleError")<{
  message: string;
  status?: number;
}> {}

class ConfigError extends Data.TaggedError("ConfigError")<{
  message: string;
}> {}

// Response types
interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ListDatabasesResponse {
  data: Database[];
}

interface Database {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  region: {
    slug: string;
    display_name: string;
  };
}

// API functions
const getOrganization = Effect.gen(function* () {
  const { token, organization } = yield* PlanetScaleCredentials;

  const response = yield* Effect.tryPromise({
    try: () =>
      fetch(`${API_BASE_URL}/organizations/${organization}`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }),
    catch: (error) =>
      new PlanetScaleError({
        message: `Network error: ${error}`,
      }),
  });

  if (!response.ok) {
    return yield* new PlanetScaleError({
      message: `Failed to get organization: ${response.statusText}`,
      status: response.status,
    });
  }

  return yield* Effect.tryPromise({
    try: () => response.json() as Promise<Organization>,
    catch: () =>
      new PlanetScaleError({
        message: "Failed to parse organization response",
      }),
  });
});

const listDatabases = Effect.gen(function* () {
  const { token, organization } = yield* PlanetScaleCredentials;

  const response = yield* Effect.tryPromise({
    try: () =>
      fetch(`${API_BASE_URL}/organizations/${organization}/databases`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }),
    catch: (error) =>
      new PlanetScaleError({
        message: `Network error: ${error}`,
      }),
  });

  if (!response.ok) {
    return yield* new PlanetScaleError({
      message: `Failed to list databases: ${response.statusText}`,
      status: response.status,
    });
  }

  return yield* Effect.tryPromise({
    try: () => response.json() as Promise<ListDatabasesResponse>,
    catch: () =>
      new PlanetScaleError({
        message: "Failed to parse databases response",
      }),
  });
});

// Layer from environment
const PlanetScaleCredentialsLive = Layer.effect(
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

export {
  getOrganization,
  listDatabases,
  PlanetScaleCredentials,
  PlanetScaleCredentialsLive,
  PlanetScaleError,
  ConfigError,
};
export type { Organization, Database, ListDatabasesResponse };
