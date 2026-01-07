import { Effect } from "effect";
import { API_BASE_URL, PlanetScaleCredentials } from "./credentials";
import { PlanetScaleError } from "./errors";

export interface Database {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  region: {
    slug: string;
    display_name: string;
  };
}

export interface ListDatabasesResponse {
  data: Database[];
}

export const listDatabases = Effect.gen(function* () {
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
