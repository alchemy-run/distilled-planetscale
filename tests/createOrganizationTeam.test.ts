import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  createOrganizationTeam,
  CreateOrganizationTeamNotfound,
  CreateOrganizationTeamInput,
  CreateOrganizationTeamOutput,
} from "../src/operations/createOrganizationTeam";
import { deleteOrganizationTeam } from "../src/operations/deleteOrganizationTeam";
import { withMainLayer } from "./setup";

withMainLayer("createOrganizationTeam", (it) => {
  it("should have the correct input schema", () => {
    expect(CreateOrganizationTeamInput.fields.organization).toBeDefined();
    expect(CreateOrganizationTeamInput.fields.name).toBeDefined();
    expect(CreateOrganizationTeamInput.fields.description).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateOrganizationTeamOutput.fields.id).toBeDefined();
    expect(CreateOrganizationTeamOutput.fields.name).toBeDefined();
    expect(CreateOrganizationTeamOutput.fields.display_name).toBeDefined();
    expect(CreateOrganizationTeamOutput.fields.slug).toBeDefined();
    expect(CreateOrganizationTeamOutput.fields.description).toBeDefined();
    expect(CreateOrganizationTeamOutput.fields.creator).toBeDefined();
    expect(CreateOrganizationTeamOutput.fields.members).toBeDefined();
    expect(CreateOrganizationTeamOutput.fields.databases).toBeDefined();
    expect(CreateOrganizationTeamOutput.fields.managed).toBeDefined();
    expect(CreateOrganizationTeamOutput.fields.created_at).toBeDefined();
    expect(CreateOrganizationTeamOutput.fields.updated_at).toBeDefined();
  });

  it.effect("should return CreateOrganizationTeamNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createOrganizationTeam({
        organization: "this-org-definitely-does-not-exist-12345",
        name: "test-team",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateOrganizationTeamNotfound);
      if (result instanceof CreateOrganizationTeamNotfound) {
        expect(result._tag).toBe("CreateOrganizationTeamNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  // Note: This test is skipped because service tokens typically don't have permission
  // to create organization teams. When run with appropriate credentials, this test
  // demonstrates proper cleanup using Effect.ensuring.
  it.skip("should create a team successfully and clean up", () => {
    const testTeamName = `test-team-${Date.now()}`;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* createOrganizationTeam({
        organization,
        name: testTeamName,
        description: "Test team created by automated tests",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", testTeamName);
      expect(result).toHaveProperty("slug");
      expect(result).toHaveProperty("display_name");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("creator");
      expect(result).toHaveProperty("members");
      expect(result).toHaveProperty("databases");

      return result;
    }).pipe(
      // Always clean up the team, even if the test fails
      Effect.ensuring(
        Effect.gen(function* () {
          const { organization } = yield* PlanetScaleCredentials;
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
