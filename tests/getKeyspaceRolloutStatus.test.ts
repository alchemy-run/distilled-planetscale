import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  getKeyspaceRolloutStatus,
  GetKeyspaceRolloutStatusNotfound,
  GetKeyspaceRolloutStatusInput,
  GetKeyspaceRolloutStatusOutput,
} from "../src/operations/getKeyspaceRolloutStatus";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getKeyspaceRolloutStatus", (it) => {
  it("should have the correct input schema", () => {
    expect(GetKeyspaceRolloutStatusInput.fields.organization).toBeDefined();
    expect(GetKeyspaceRolloutStatusInput.fields.database).toBeDefined();
    expect(GetKeyspaceRolloutStatusInput.fields.branch).toBeDefined();
    expect(GetKeyspaceRolloutStatusInput.fields.keyspace).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetKeyspaceRolloutStatusOutput.fields.name).toBeDefined();
    expect(GetKeyspaceRolloutStatusOutput.fields.state).toBeDefined();
    expect(GetKeyspaceRolloutStatusOutput.fields.shards).toBeDefined();
  });

  it.effect("should return GetKeyspaceRolloutStatusNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getKeyspaceRolloutStatus({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        keyspace: "test-keyspace",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetKeyspaceRolloutStatusNotfound);
      if (result instanceof GetKeyspaceRolloutStatusNotfound) {
        expect(result._tag).toBe("GetKeyspaceRolloutStatusNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetKeyspaceRolloutStatusNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getKeyspaceRolloutStatus({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        keyspace: "test-keyspace",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetKeyspaceRolloutStatusNotfound);
      if (result instanceof GetKeyspaceRolloutStatusNotfound) {
        expect(result._tag).toBe("GetKeyspaceRolloutStatusNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetKeyspaceRolloutStatusNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getKeyspaceRolloutStatus({
        organization,
        database: TEST_DATABASE,
        branch: "this-branch-definitely-does-not-exist-12345",
        keyspace: "test-keyspace",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetKeyspaceRolloutStatusNotfound);
      if (result instanceof GetKeyspaceRolloutStatusNotfound) {
        expect(result._tag).toBe("GetKeyspaceRolloutStatusNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetKeyspaceRolloutStatusNotfound for non-existent keyspace", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getKeyspaceRolloutStatus({
        organization,
        database: TEST_DATABASE,
        branch: "main",
        keyspace: "this-keyspace-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetKeyspaceRolloutStatusNotfound);
      if (result instanceof GetKeyspaceRolloutStatusNotfound) {
        expect(result._tag).toBe("GetKeyspaceRolloutStatusNotfound");
        expect(result.organization).toBe(organization);
        expect(result.keyspace).toBe("this-keyspace-definitely-does-not-exist-12345");
      }
    }),
  );
});
