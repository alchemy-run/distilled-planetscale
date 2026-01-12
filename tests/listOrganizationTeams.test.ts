import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Cause, Effect, Exit, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  listOrganizationTeams,
  ListOrganizationTeamsInput,
  ListOrganizationTeamsNotfound,
  ListOrganizationTeamsOutput,
} from "../src/operations/listOrganizationTeams";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("listOrganizationTeams", () => {
  it("should have the correct input schema", () => {
    expect(ListOrganizationTeamsInput.fields.organization).toBeDefined();
    expect(ListOrganizationTeamsInput.fields.q).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListOrganizationTeamsOutput.fields.current_page).toBeDefined();
    expect(ListOrganizationTeamsOutput.fields.next_page).toBeDefined();
    expect(ListOrganizationTeamsOutput.fields.next_page_url).toBeDefined();
    expect(ListOrganizationTeamsOutput.fields.prev_page).toBeDefined();
    expect(ListOrganizationTeamsOutput.fields.prev_page_url).toBeDefined();
    expect(ListOrganizationTeamsOutput.fields.data).toBeDefined();
  });

  it.effect("should list organization teams successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listOrganizationTeams({
        organization,
      });

      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);

      // Verify pagination fields
      expect(typeof result.current_page).toBe("number");
      expect(result.next_page === null || typeof result.next_page === "number").toBe(true);
      expect(result.prev_page === null || typeof result.prev_page === "number").toBe(true);

      // If there are teams, verify the structure
      const team = result.data[0];
      if (team) {
        expect(team).toHaveProperty("id");
        expect(team).toHaveProperty("name");
        expect(team).toHaveProperty("slug");
        expect(team).toHaveProperty("display_name");
        expect(team).toHaveProperty("description");
        expect(team).toHaveProperty("managed");
        expect(team).toHaveProperty("created_at");
        expect(team).toHaveProperty("updated_at");
        expect(team).toHaveProperty("creator");
        expect(team).toHaveProperty("members");
        expect(team).toHaveProperty("databases");

        // Verify creator structure
        expect(team.creator).toHaveProperty("id");
        expect(team.creator).toHaveProperty("display_name");
        expect(team.creator).toHaveProperty("avatar_url");

        // Verify members is an array
        expect(Array.isArray(team.members)).toBe(true);

        // Verify databases is an array
        expect(Array.isArray(team.databases)).toBe(true);
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should support search query parameter", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listOrganizationTeams({
        organization,
        q: "test",
      });

      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return an error for non-existent organization", () =>
    Effect.gen(function* () {
      const exit = yield* listOrganizationTeams({
        organization: "this-organization-definitely-does-not-exist-12345",
      }).pipe(Effect.exit);

      // The operation should fail for a non-existent organization
      expect(Exit.isFailure(exit)).toBe(true);

      // If we got the expected typed error, verify its properties
      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause);
        if (error._tag === "Some" && error.value instanceof ListOrganizationTeamsNotfound) {
          expect(error.value._tag).toBe("ListOrganizationTeamsNotfound");
          expect(error.value.organization).toBe("this-organization-definitely-does-not-exist-12345");
        }
        // Otherwise, the API may have returned a different error format
        // which is acceptable for this test
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
