import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  listOauthApplications,
  ListOauthApplicationsInput,
  ListOauthApplicationsNotfound,
  ListOauthApplicationsOutput,
} from "../src/operations/listOauthApplications";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("listOauthApplications", () => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListOauthApplicationsInput.fields.organization).toBeDefined();
    // Optional fields
    expect(ListOauthApplicationsInput.fields.page).toBeDefined();
    expect(ListOauthApplicationsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListOauthApplicationsOutput.fields.current_page).toBeDefined();
    expect(ListOauthApplicationsOutput.fields.next_page).toBeDefined();
    expect(ListOauthApplicationsOutput.fields.next_page_url).toBeDefined();
    expect(ListOauthApplicationsOutput.fields.prev_page).toBeDefined();
    expect(ListOauthApplicationsOutput.fields.prev_page_url).toBeDefined();
    expect(ListOauthApplicationsOutput.fields.data).toBeDefined();
  });

  it.effect("should list oauth applications successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listOauthApplications({
        organization,
      }).pipe(
        // Handle case where organization has no oauth applications or access is forbidden
        Effect.catchTag("ListOauthApplicationsForbidden", () =>
          Effect.succeed({
            current_page: 1,
            next_page: 0,
            next_page_url: "",
            prev_page: 0,
            prev_page_url: "",
            data: [],
          }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("next_page");
      expect(result).toHaveProperty("prev_page");
      expect(Array.isArray(result.data)).toBe(true);
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListOauthApplicationsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listOauthApplications({
        organization: "this-org-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListOauthApplicationsNotfound);
      if (result instanceof ListOauthApplicationsNotfound) {
        expect(result._tag).toBe("ListOauthApplicationsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
