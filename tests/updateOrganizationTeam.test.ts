import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  updateOrganizationTeam,
  UpdateOrganizationTeamNotfound,
  UpdateOrganizationTeamForbidden,
  UpdateOrganizationTeamInput,
  UpdateOrganizationTeamOutput,
} from "../src/operations/updateOrganizationTeam";
import { createOrganizationTeam } from "../src/operations/createOrganizationTeam";
import { deleteOrganizationTeam } from "../src/operations/deleteOrganizationTeam";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("updateOrganizationTeam", () => {
  it("should have the correct input schema", () => {
    expect(UpdateOrganizationTeamInput.fields.organization).toBeDefined();
    expect(UpdateOrganizationTeamInput.fields.team).toBeDefined();
    expect(UpdateOrganizationTeamInput.fields.name).toBeDefined();
    expect(UpdateOrganizationTeamInput.fields.description).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateOrganizationTeamOutput.fields.id).toBeDefined();
    expect(UpdateOrganizationTeamOutput.fields.name).toBeDefined();
    expect(UpdateOrganizationTeamOutput.fields.display_name).toBeDefined();
    expect(UpdateOrganizationTeamOutput.fields.slug).toBeDefined();
    expect(UpdateOrganizationTeamOutput.fields.description).toBeDefined();
    expect(UpdateOrganizationTeamOutput.fields.creator).toBeDefined();
    expect(UpdateOrganizationTeamOutput.fields.members).toBeDefined();
    expect(UpdateOrganizationTeamOutput.fields.databases).toBeDefined();
    expect(UpdateOrganizationTeamOutput.fields.managed).toBeDefined();
    expect(UpdateOrganizationTeamOutput.fields.created_at).toBeDefined();
    expect(UpdateOrganizationTeamOutput.fields.updated_at).toBeDefined();
  });

  it.effect("should return UpdateOrganizationTeamForbidden for non-existent team", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* updateOrganizationTeam({
        organization,
        team: "this-team-definitely-does-not-exist-12345",
        name: "new-name",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      // The API returns forbidden for non-existent teams (to avoid revealing team existence)
      expect(result).toBeInstanceOf(UpdateOrganizationTeamForbidden);
      if (result instanceof UpdateOrganizationTeamForbidden) {
        expect(result._tag).toBe("UpdateOrganizationTeamForbidden");
        expect(result.organization).toBe(organization);
        expect(result.team).toBe("this-team-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdateOrganizationTeamNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateOrganizationTeam({
        organization: "this-org-definitely-does-not-exist-12345",
        team: "test-team",
        name: "new-name",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateOrganizationTeamNotfound);
      if (result instanceof UpdateOrganizationTeamNotfound) {
        expect(result._tag).toBe("UpdateOrganizationTeamNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because service tokens typically don't have permission
  // to create/update/delete organization teams. When run with appropriate credentials,
  // this test demonstrates the full create-update-delete workflow with proper cleanup.
  it.skip("should update a team successfully and clean up", () => {
    const testTeamName = `test-team-${Date.now()}`;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a team to update
      yield* createOrganizationTeam({
        organization,
        name: testTeamName,
        description: "Test team created by automated tests",
      });

      // Now update the team
      const result = yield* updateOrganizationTeam({
        organization,
        team: testTeamName,
        name: `${testTeamName}-updated`,
        description: "Updated description",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", `${testTeamName}-updated`);
      expect(result).toHaveProperty("description", "Updated description");
      expect(result).toHaveProperty("slug");
      expect(result).toHaveProperty("display_name");
      expect(result).toHaveProperty("creator");
      expect(result).toHaveProperty("members");
      expect(result).toHaveProperty("databases");
      expect(result).toHaveProperty("managed");

      return result;
    }).pipe(
      // Always clean up the team, even if the test fails
      Effect.ensuring(
        Effect.gen(function* () {
          const { organization } = yield* PlanetScaleCredentials;
          // Try to delete with both original and updated names
          yield* deleteOrganizationTeam({
            organization,
            team: `${testTeamName}-updated`,
          }).pipe(Effect.ignore);
          yield* deleteOrganizationTeam({
            organization,
            team: testTeamName,
          }).pipe(Effect.ignore);
        }),
      ),
      Effect.provide(MainLayer),
    );
  });
});
