import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  deleteKeyspace,
  DeleteKeyspaceNotfound,
  DeleteKeyspaceInput,
  DeleteKeyspaceOutput,
} from "../src/operations/deleteKeyspace";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("deleteKeyspace", (it) => {
  it("should have the correct input schema", () => {
    expect(DeleteKeyspaceInput.fields.organization).toBeDefined();
    expect(DeleteKeyspaceInput.fields.database).toBeDefined();
    expect(DeleteKeyspaceInput.fields.branch).toBeDefined();
    expect(DeleteKeyspaceInput.fields.keyspace).toBeDefined();
  });

  it("should have the correct output schema (Void)", () => {
    // DeleteKeyspaceOutput is Schema.Void, so it doesn't have fields
    expect(DeleteKeyspaceOutput).toBeDefined();
  });

  it.effect("should return DeleteKeyspaceNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteKeyspace({
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

      expect(result).toBeInstanceOf(DeleteKeyspaceNotfound);
      if (result instanceof DeleteKeyspaceNotfound) {
        expect(result._tag).toBe("DeleteKeyspaceNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeleteKeyspaceNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* deleteKeyspace({
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

      expect(result).toBeInstanceOf(DeleteKeyspaceNotfound);
      if (result instanceof DeleteKeyspaceNotfound) {
        expect(result._tag).toBe("DeleteKeyspaceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeleteKeyspaceNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* deleteKeyspace({
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

      expect(result).toBeInstanceOf(DeleteKeyspaceNotfound);
      if (result instanceof DeleteKeyspaceNotfound) {
        expect(result._tag).toBe("DeleteKeyspaceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeleteKeyspaceNotfound for non-existent keyspace", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* deleteKeyspace({
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

      expect(result).toBeInstanceOf(DeleteKeyspaceNotfound);
      if (result instanceof DeleteKeyspaceNotfound) {
        expect(result._tag).toBe("DeleteKeyspaceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.keyspace).toBe("this-keyspace-definitely-does-not-exist-12345");
      }
    }),
  );
});
