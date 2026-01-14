import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  updateAutoDeleteBranch,
  UpdateAutoDeleteBranchNotfound,
  UpdateAutoDeleteBranchInput,
  UpdateAutoDeleteBranchOutput,
} from "../src/operations/updateAutoDeleteBranch";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("updateAutoDeleteBranch", (it) => {
  it("should have the correct input schema", () => {
    expect(UpdateAutoDeleteBranchInput.fields.organization).toBeDefined();
    expect(UpdateAutoDeleteBranchInput.fields.database).toBeDefined();
    expect(UpdateAutoDeleteBranchInput.fields.number).toBeDefined();
    expect(UpdateAutoDeleteBranchInput.fields.enable).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateAutoDeleteBranchOutput.fields.id).toBeDefined();
    expect(UpdateAutoDeleteBranchOutput.fields.number).toBeDefined();
    expect(UpdateAutoDeleteBranchOutput.fields.state).toBeDefined();
    expect(UpdateAutoDeleteBranchOutput.fields.deployment_state).toBeDefined();
    expect(UpdateAutoDeleteBranchOutput.fields.branch).toBeDefined();
    expect(UpdateAutoDeleteBranchOutput.fields.into_branch).toBeDefined();
    expect(UpdateAutoDeleteBranchOutput.fields.deployment).toBeDefined();
  });

  it.effect("should return UpdateAutoDeleteBranchNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateAutoDeleteBranch({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
        enable: true,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateAutoDeleteBranchNotfound);
      if (result instanceof UpdateAutoDeleteBranchNotfound) {
        expect(result._tag).toBe("UpdateAutoDeleteBranchNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateAutoDeleteBranchNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* updateAutoDeleteBranch({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
        enable: true,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateAutoDeleteBranchNotfound);
      if (result instanceof UpdateAutoDeleteBranchNotfound) {
        expect(result._tag).toBe("UpdateAutoDeleteBranchNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateAutoDeleteBranchNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* updateAutoDeleteBranch({
        organization,
        database,
        number: 999999999,
        enable: true,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateAutoDeleteBranchNotfound);
      if (result instanceof UpdateAutoDeleteBranchNotfound) {
        expect(result._tag).toBe("UpdateAutoDeleteBranchNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }),
  );
});
