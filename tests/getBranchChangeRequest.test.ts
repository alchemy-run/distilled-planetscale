import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getBranchChangeRequest,
  GetBranchChangeRequestNotfound,
  GetBranchChangeRequestInput,
  GetBranchChangeRequestOutput,
} from "../src/operations/getBranchChangeRequest";
import { withMainLayer } from "./setup";

withMainLayer("getBranchChangeRequest", (it) => {
  it("should have the correct input schema", () => {
    expect(GetBranchChangeRequestInput.fields.organization).toBeDefined();
    expect(GetBranchChangeRequestInput.fields.database).toBeDefined();
    expect(GetBranchChangeRequestInput.fields.branch).toBeDefined();
    expect(GetBranchChangeRequestInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetBranchChangeRequestOutput.fields.id).toBeDefined();
    expect(GetBranchChangeRequestOutput.fields.state).toBeDefined();
    expect(GetBranchChangeRequestOutput.fields.started_at).toBeDefined();
    expect(GetBranchChangeRequestOutput.fields.completed_at).toBeDefined();
    expect(GetBranchChangeRequestOutput.fields.created_at).toBeDefined();
    expect(GetBranchChangeRequestOutput.fields.updated_at).toBeDefined();
    expect(GetBranchChangeRequestOutput.fields.actor).toBeDefined();
    expect(GetBranchChangeRequestOutput.fields.cluster_name).toBeDefined();
    expect(GetBranchChangeRequestOutput.fields.replicas).toBeDefined();
  });

  it.effect("should return GetBranchChangeRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getBranchChangeRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        id: "fake-change-request-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetBranchChangeRequestNotfound);
      if (result instanceof GetBranchChangeRequestNotfound) {
        expect(result._tag).toBe("GetBranchChangeRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetBranchChangeRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getBranchChangeRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        id: "fake-change-request-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetBranchChangeRequestNotfound);
      if (result instanceof GetBranchChangeRequestNotfound) {
        expect(result._tag).toBe("GetBranchChangeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetBranchChangeRequestNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* getBranchChangeRequest({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        id: "fake-change-request-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetBranchChangeRequestNotfound);
      if (result instanceof GetBranchChangeRequestNotfound) {
        expect(result._tag).toBe("GetBranchChangeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetBranchChangeRequestNotfound for non-existent change request id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const branch = "main";
      const result = yield* getBranchChangeRequest({
        organization,
        database,
        branch,
        id: "this-change-request-id-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetBranchChangeRequestNotfound);
      if (result instanceof GetBranchChangeRequestNotfound) {
        expect(result._tag).toBe("GetBranchChangeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-change-request-id-definitely-does-not-exist-12345");
      }
    }),
  );
});
