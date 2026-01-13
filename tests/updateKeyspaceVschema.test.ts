import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  updateKeyspaceVschema,
  UpdateKeyspaceVschemaNotfound,
  UpdateKeyspaceVschemaInput,
  UpdateKeyspaceVschemaOutput,
} from "../src/operations/updateKeyspaceVschema";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("updateKeyspaceVschema", (it) => {
  it("should have the correct input schema", () => {
    expect(UpdateKeyspaceVschemaInput.fields.organization).toBeDefined();
    expect(UpdateKeyspaceVschemaInput.fields.database).toBeDefined();
    expect(UpdateKeyspaceVschemaInput.fields.branch).toBeDefined();
    expect(UpdateKeyspaceVschemaInput.fields.keyspace).toBeDefined();
    expect(UpdateKeyspaceVschemaInput.fields.vschema).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateKeyspaceVschemaOutput.fields.raw).toBeDefined();
  });

  it.effect("should return UpdateKeyspaceVschemaNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateKeyspaceVschema({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        keyspace: "test-keyspace",
        vschema: "{}",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateKeyspaceVschemaNotfound);
      if (result instanceof UpdateKeyspaceVschemaNotfound) {
        expect(result._tag).toBe("UpdateKeyspaceVschemaNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateKeyspaceVschemaNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateKeyspaceVschema({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        keyspace: "test-keyspace",
        vschema: "{}",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateKeyspaceVschemaNotfound);
      if (result instanceof UpdateKeyspaceVschemaNotfound) {
        expect(result._tag).toBe("UpdateKeyspaceVschemaNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateKeyspaceVschemaNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateKeyspaceVschema({
        organization,
        database: TEST_DATABASE,
        branch: "this-branch-definitely-does-not-exist-12345",
        keyspace: "test-keyspace",
        vschema: "{}",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateKeyspaceVschemaNotfound);
      if (result instanceof UpdateKeyspaceVschemaNotfound) {
        expect(result._tag).toBe("UpdateKeyspaceVschemaNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateKeyspaceVschemaNotfound for non-existent keyspace", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateKeyspaceVschema({
        organization,
        database: TEST_DATABASE,
        branch: "main",
        keyspace: "this-keyspace-definitely-does-not-exist-12345",
        vschema: "{}",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateKeyspaceVschemaNotfound);
      if (result instanceof UpdateKeyspaceVschemaNotfound) {
        expect(result._tag).toBe("UpdateKeyspaceVschemaNotfound");
        expect(result.organization).toBe(organization);
        expect(result.keyspace).toBe("this-keyspace-definitely-does-not-exist-12345");
      }
    }),
  );
});
