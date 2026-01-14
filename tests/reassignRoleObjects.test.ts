import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  reassignRoleObjects,
  ReassignRoleObjectsNotfound,
  ReassignRoleObjectsInput,
  ReassignRoleObjectsOutput,
} from "../src/operations/reassignRoleObjects";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("reassignRoleObjects", (it) => {
  it("should have the correct input schema", () => {
    expect(ReassignRoleObjectsInput.fields.organization).toBeDefined();
    expect(ReassignRoleObjectsInput.fields.database).toBeDefined();
    expect(ReassignRoleObjectsInput.fields.branch).toBeDefined();
    expect(ReassignRoleObjectsInput.fields.id).toBeDefined();
    expect(ReassignRoleObjectsInput.fields.successor).toBeDefined();
  });

  it("should have a void output schema", () => {
    // ReassignRoleObjectsOutput is Schema.Void
    expect(ReassignRoleObjectsOutput).toBeDefined();
  });

  it.effect("should return ReassignRoleObjectsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* reassignRoleObjects({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        id: "some-role-id",
        successor: "some-successor-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ReassignRoleObjectsNotfound);
      if (result instanceof ReassignRoleObjectsNotfound) {
        expect(result._tag).toBe("ReassignRoleObjectsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ReassignRoleObjectsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* reassignRoleObjects({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        id: "some-role-id",
        successor: "some-successor-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ReassignRoleObjectsNotfound);
      if (result instanceof ReassignRoleObjectsNotfound) {
        expect(result._tag).toBe("ReassignRoleObjectsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ReassignRoleObjectsNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const result = yield* reassignRoleObjects({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        id: "some-role-id",
        successor: "some-successor-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ReassignRoleObjectsNotfound);
      if (result instanceof ReassignRoleObjectsNotfound) {
        expect(result._tag).toBe("ReassignRoleObjectsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ReassignRoleObjectsNotfound for non-existent role id", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const branch = "main";
      const result = yield* reassignRoleObjects({
        organization,
        database,
        branch,
        id: "this-role-id-definitely-does-not-exist-12345",
        successor: "some-successor-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ReassignRoleObjectsNotfound);
      if (result instanceof ReassignRoleObjectsNotfound) {
        expect(result._tag).toBe("ReassignRoleObjectsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-role-id-definitely-does-not-exist-12345");
      }
    }),
  );
});
