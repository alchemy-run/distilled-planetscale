import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  updateBranchChangeRequest,
  UpdateBranchChangeRequestNotfound,
  UpdateBranchChangeRequestInput,
  UpdateBranchChangeRequestOutput,
} from "../src/operations/updateBranchChangeRequest";
import { withMainLayer } from "./setup";

withMainLayer("updateBranchChangeRequest", (it) => {
  it("should have the correct input schema", () => {
    expect(UpdateBranchChangeRequestInput.fields.organization).toBeDefined();
    expect(UpdateBranchChangeRequestInput.fields.database).toBeDefined();
    expect(UpdateBranchChangeRequestInput.fields.branch).toBeDefined();
    expect(UpdateBranchChangeRequestInput.fields.cluster_size).toBeDefined();
    expect(UpdateBranchChangeRequestInput.fields.replicas).toBeDefined();
    expect(UpdateBranchChangeRequestInput.fields.parameters).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateBranchChangeRequestOutput.fields.id).toBeDefined();
    expect(UpdateBranchChangeRequestOutput.fields.state).toBeDefined();
    expect(UpdateBranchChangeRequestOutput.fields.started_at).toBeDefined();
    expect(UpdateBranchChangeRequestOutput.fields.completed_at).toBeDefined();
    expect(UpdateBranchChangeRequestOutput.fields.created_at).toBeDefined();
    expect(UpdateBranchChangeRequestOutput.fields.updated_at).toBeDefined();
    expect(UpdateBranchChangeRequestOutput.fields.actor).toBeDefined();
    expect(UpdateBranchChangeRequestOutput.fields.cluster_name).toBeDefined();
    expect(UpdateBranchChangeRequestOutput.fields.replicas).toBeDefined();
    expect(UpdateBranchChangeRequestOutput.fields.previous_cluster_name).toBeDefined();
    expect(UpdateBranchChangeRequestOutput.fields.previous_replicas).toBeDefined();
  });

  it.effect("should return UpdateBranchChangeRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateBranchChangeRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBranchChangeRequestNotfound);
      if (result instanceof UpdateBranchChangeRequestNotfound) {
        expect(result._tag).toBe("UpdateBranchChangeRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateBranchChangeRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateBranchChangeRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBranchChangeRequestNotfound);
      if (result instanceof UpdateBranchChangeRequestNotfound) {
        expect(result._tag).toBe("UpdateBranchChangeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateBranchChangeRequestNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* updateBranchChangeRequest({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBranchChangeRequestNotfound);
      if (result instanceof UpdateBranchChangeRequestNotfound) {
        expect(result._tag).toBe("UpdateBranchChangeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );
});
