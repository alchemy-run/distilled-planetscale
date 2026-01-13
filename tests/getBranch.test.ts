import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getBranch,
  GetBranchNotfound,
  GetBranchInput,
  GetBranchOutput,
} from "../src/operations/getBranch";
import { withMainLayer } from "./setup";

withMainLayer("getBranch", (it) => {
  it("should have the correct input schema", () => {
    expect(GetBranchInput.fields.organization).toBeDefined();
    expect(GetBranchInput.fields.database).toBeDefined();
    expect(GetBranchInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetBranchOutput.fields.id).toBeDefined();
    expect(GetBranchOutput.fields.name).toBeDefined();
    expect(GetBranchOutput.fields.created_at).toBeDefined();
    expect(GetBranchOutput.fields.updated_at).toBeDefined();
    expect(GetBranchOutput.fields.state).toBeDefined();
    expect(GetBranchOutput.fields.ready).toBeDefined();
    expect(GetBranchOutput.fields.production).toBeDefined();
    expect(GetBranchOutput.fields.region).toBeDefined();
    expect(GetBranchOutput.fields.parent_branch).toBeDefined();
  });

  it.effect("should return GetBranchNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getBranch({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetBranchNotfound);
      if (result instanceof GetBranchNotfound) {
        expect(result._tag).toBe("GetBranchNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetBranchNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getBranch({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetBranchNotfound);
      if (result instanceof GetBranchNotfound) {
        expect(result._tag).toBe("GetBranchNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetBranchNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getBranch({
        organization,
        database: "test",
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetBranchNotfound);
      if (result instanceof GetBranchNotfound) {
        expect(result._tag).toBe("GetBranchNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("test");
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );
});
