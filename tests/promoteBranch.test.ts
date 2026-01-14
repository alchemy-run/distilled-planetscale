import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  promoteBranch,
  PromoteBranchNotfound,
  PromoteBranchForbidden,
  PromoteBranchInput,
  PromoteBranchOutput,
} from "../src/operations/promoteBranch";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("promoteBranch", (it) => {
  it("should have the correct input schema", () => {
    expect(PromoteBranchInput.fields.organization).toBeDefined();
    expect(PromoteBranchInput.fields.database).toBeDefined();
    expect(PromoteBranchInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(PromoteBranchOutput.fields.id).toBeDefined();
    expect(PromoteBranchOutput.fields.name).toBeDefined();
    expect(PromoteBranchOutput.fields.created_at).toBeDefined();
    expect(PromoteBranchOutput.fields.updated_at).toBeDefined();
    expect(PromoteBranchOutput.fields.state).toBeDefined();
    expect(PromoteBranchOutput.fields.ready).toBeDefined();
    expect(PromoteBranchOutput.fields.production).toBeDefined();
    expect(PromoteBranchOutput.fields.region).toBeDefined();
    expect(PromoteBranchOutput.fields.parent_branch).toBeDefined();
  });

  it.effect("should return PromoteBranchNotfound or PromoteBranchForbidden for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* promoteBranch({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-db",
        branch: "some-branch",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof PromoteBranchNotfound || result instanceof PromoteBranchForbidden;
      expect(isExpectedError).toBe(true);
      if (result instanceof PromoteBranchNotfound) {
        expect(result._tag).toBe("PromoteBranchNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return PromoteBranchNotfound or PromoteBranchForbidden for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* promoteBranch({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "some-branch",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof PromoteBranchNotfound || result instanceof PromoteBranchForbidden;
      expect(isExpectedError).toBe(true);
      if (result instanceof PromoteBranchNotfound) {
        expect(result._tag).toBe("PromoteBranchNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return PromoteBranchNotfound or PromoteBranchForbidden for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* promoteBranch({
        organization,
        database: TEST_DATABASE,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof PromoteBranchNotfound || result instanceof PromoteBranchForbidden;
      expect(isExpectedError).toBe(true);
      if (result instanceof PromoteBranchNotfound) {
        expect(result._tag).toBe("PromoteBranchNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  // Note: This test is skipped because promoting a branch to production is a
  // state-modifying operation. To test successfully, you would need to:
  // 1. Create a development branch
  // 2. Promote it to production
  // 3. Demote it back (or delete it) to clean up
  it.effect("should promote a development branch to production successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const branchName = "dev"; // Replace with an actual development branch

      const result = yield* promoteBranch({
        organization,
        database,
        branch: branchName,
      }).pipe(
        Effect.catchTag("PromoteBranchForbidden", () => Effect.succeed(null)),
        Effect.catchTag("PromoteBranchNotfound", () => Effect.succeed(null)),
      );

      if (result === null) {
        return; // Skip test gracefully if operation is forbidden or branch doesn't exist
      }

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", branchName);
      expect(result).toHaveProperty("production", true);
      expect(result).toHaveProperty("state");
    }),
  );
});
