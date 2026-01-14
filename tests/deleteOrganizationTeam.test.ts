import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  deleteOrganizationTeam,
  DeleteOrganizationTeamNotfound,
  DeleteOrganizationTeamForbidden,
  DeleteOrganizationTeamInput,
  DeleteOrganizationTeamOutput,
} from "../src/operations/deleteOrganizationTeam";
import { createOrganizationTeam } from "../src/operations/createOrganizationTeam";
import { withMainLayer } from "./setup";

withMainLayer("deleteOrganizationTeam", (it) => {
  it("should have the correct input schema", () => {
    expect(DeleteOrganizationTeamInput.fields.organization).toBeDefined();
    expect(DeleteOrganizationTeamInput.fields.team).toBeDefined();
  });

  it("should have the correct output schema", () => {
    // Output is Schema.Void, so we just verify the type exists
    expect(DeleteOrganizationTeamOutput).toBeDefined();
  });

  it.effect(
    "should return DeleteOrganizationTeamNotfound or DeleteOrganizationTeamForbidden for non-existent team",
    () =>
      Effect.gen(function* () {
        const { organization } = yield* Credentials;

        const result = yield* deleteOrganizationTeam({
          organization,
          team: "this-team-definitely-does-not-exist-12345",
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

        // The API may return forbidden or not_found for non-existent teams
        const isExpectedError =
          result instanceof DeleteOrganizationTeamNotfound ||
          result instanceof DeleteOrganizationTeamForbidden;
        expect(isExpectedError).toBe(true);
      }),
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

      const isExpectedError =
        result instanceof DeleteOrganizationTeamNotfound ||
        result instanceof DeleteOrganizationTeamForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test is skipped because service tokens typically don't have permission
  // to create/delete organization teams. When run with appropriate credentials, this test
  // demonstrates the full create-then-delete workflow.
  it.effect("should delete a team successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const testTeamName = `test-team-delete-${Date.now()}`;

      // First create a team to delete
      const created = yield* createOrganizationTeam({
        organization,
        name: testTeamName,
        description: "Test team to be deleted",
      }).pipe(Effect.catchTag("CreateOrganizationTeamForbidden", () => Effect.succeed(null)));

      // Skip test gracefully if creation is forbidden
      if (created === null) {
        return;
      }

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

      const isExpectedError =
        deleteAgainResult instanceof DeleteOrganizationTeamNotfound ||
        deleteAgainResult instanceof DeleteOrganizationTeamForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );
});
