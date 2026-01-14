import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import { createBranch } from "../src/operations/createBranch";
import {
  deleteBranch,
  DeleteBranchNotfound,
  DeleteBranchForbidden,
  DeleteBranchInput,
  DeleteBranchOutput,
} from "../src/operations/deleteBranch";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("deleteBranch", (it) => {
  it("should have the correct input schema", () => {
    expect(DeleteBranchInput.fields.organization).toBeDefined();
    expect(DeleteBranchInput.fields.database).toBeDefined();
    expect(DeleteBranchInput.fields.branch).toBeDefined();
  });

  it("should have a void output schema", () => {
    // DeleteBranchOutput is Schema.Void
    expect(DeleteBranchOutput).toBeDefined();
  });

  it.effect(
    "should return DeleteBranchNotfound or DeleteBranchForbidden for non-existent organization",
    () =>
      Effect.gen(function* () {
        const result = yield* deleteBranch({
          organization: "this-org-definitely-does-not-exist-12345",
          database: "some-db",
          branch: "some-branch",
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

        const isExpectedError =
          result instanceof DeleteBranchNotfound || result instanceof DeleteBranchForbidden;
        expect(isExpectedError).toBe(true);
        if (result instanceof DeleteBranchNotfound) {
          expect(result._tag).toBe("DeleteBranchNotfound");
          expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
        }
      }),
  );

  it.effect(
    "should return DeleteBranchNotfound or DeleteBranchForbidden for non-existent database",
    () =>
      Effect.gen(function* () {
        const { organization } = yield* Credentials;
        const result = yield* deleteBranch({
          organization,
          database: "this-database-definitely-does-not-exist-12345",
          branch: "some-branch",
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

        const isExpectedError =
          result instanceof DeleteBranchNotfound || result instanceof DeleteBranchForbidden;
        expect(isExpectedError).toBe(true);
        if (result instanceof DeleteBranchNotfound) {
          expect(result._tag).toBe("DeleteBranchNotfound");
          expect(result.organization).toBe(organization);
          expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
        }
      }),
  );

  it.effect(
    "should return DeleteBranchNotfound or DeleteBranchForbidden for non-existent branch",
    () =>
      Effect.gen(function* () {
        const { organization } = yield* Credentials;
        const result = yield* deleteBranch({
          organization,
          database: TEST_DATABASE,
          branch: "this-branch-definitely-does-not-exist-12345",
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

        const isExpectedError =
          result instanceof DeleteBranchNotfound || result instanceof DeleteBranchForbidden;
        expect(isExpectedError).toBe(true);
        if (result instanceof DeleteBranchNotfound) {
          expect(result._tag).toBe("DeleteBranchNotfound");
          expect(result.organization).toBe(organization);
          expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
        }
      }),
  );

  // Note: This test is skipped because it requires creating and deleting branches
  // which may incur costs and require an existing database.
  it.effect("should delete a branch successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const testBranchName = `test-branch-delete-${Date.now()}`;

      // First create a branch to delete
      const branch = yield* createBranch({
        organization,
        database,
        name: testBranchName,
        parent_branch: "main",
      }).pipe(Effect.catchTag("CreateBranchForbidden", () => Effect.succeed(null)));

      if (branch === null) {
        return; // Skip test gracefully if creation is forbidden
      }

      // Now delete it
      const result = yield* deleteBranch({
        organization,
        database,
        branch: testBranchName,
      });

      // deleteBranch returns void (null) on success
      expect(result).toBeNull();
    }),
  );
});
