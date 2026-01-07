import { Effect } from "effect";
import { API_BASE_URL, PlanetScaleCredentials } from "./credentials";
import { PlanetScaleError } from "./errors";

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const getOrganization = Effect.gen(function* () {
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
