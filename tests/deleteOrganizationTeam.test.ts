import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  deleteOrganizationTeam,
  DeleteOrganizationTeamNotfound,
  DeleteOrganizationTeamForbidden,
  DeleteOrganizationTeamInput,
  DeleteOrganizationTeamOutput,
} from "../src/operations/deleteOrganizationTeam";
import { createOrganizationTeam } from "../src/operations/createOrganizationTeam";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("deleteOrganizationTeam", () => {
  it("should have the correct input schema", () => {
    expect(DeleteOrganizationTeamInput.fields.organization).toBeDefined();
    expect(DeleteOrganizationTeamInput.fields.team).toBeDefined();
  });

  it("should have the correct output schema", () => {
    // Output is Schema.Void, so we just verify the type exists
    expect(DeleteOrganizationTeamOutput).toBeDefined();
  });

  it.effect("should return DeleteOrganizationTeamForbidden for non-existent team", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* deleteOrganizationTeam({
        organization,
        team: "this-team-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      // The API returns forbidden for non-existent teams (to avoid revealing team existence)
      expect(result).toBeInstanceOf(DeleteOrganizationTeamForbidden);
      if (result instanceof DeleteOrganizationTeamForbidden) {
        expect(result._tag).toBe("DeleteOrganizationTeamForbidden");
        expect(result.organization).toBe(organization);
        expect(result.team).toBe("this-team-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteOrganizationTeamNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteOrganizationTeam({
        organization: "this-org-definitely-does-not-exist-12345",
        team: "test-team",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteOrganizationTeamNotfound);
      if (result instanceof DeleteOrganizationTeamNotfound) {
        expect(result._tag).toBe("DeleteOrganizationTeamNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because service tokens typically don't have permission
  // to create/delete organization teams. When run with appropriate credentials, this test
  // demonstrates the full create-then-delete workflow.
  it.skip("should delete a team successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const testTeamName = `test-team-delete-${Date.now()}`;

      // First create a team to delete
      yield* createOrganizationTeam({
        organization,
        name: testTeamName,
        description: "Test team to be deleted",
      });

      // Now delete the team
      const result = yield* deleteOrganizationTeam({
        organization,
        team: testTeamName,
      });

      // Output is void, so result should be undefined
      expect(result).toBeUndefined();

      // Verify the team no longer exists by trying to delete again
      const deleteAgainResult = yield* deleteOrganizationTeam({
        organization,
        team: testTeamName,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(deleteAgainResult).toBeInstanceOf(DeleteOrganizationTeamNotfound);
    }).pipe(Effect.provide(MainLayer)),
  );
});
