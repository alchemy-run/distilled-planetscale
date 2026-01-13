import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getKeyspaceVschema,
  GetKeyspaceVschemaNotfound,
  GetKeyspaceVschemaInput,
  GetKeyspaceVschemaOutput,
} from "../src/operations/getKeyspaceVschema";
import { withMainLayer } from "./setup";

withMainLayer("getKeyspaceVschema", (it) => {
  it("should have the correct input schema", () => {
    expect(GetKeyspaceVschemaInput.fields.organization).toBeDefined();
    expect(GetKeyspaceVschemaInput.fields.database).toBeDefined();
    expect(GetKeyspaceVschemaInput.fields.branch).toBeDefined();
    expect(GetKeyspaceVschemaInput.fields.keyspace).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetKeyspaceVschemaOutput.fields.raw).toBeDefined();
  });

  it.effect("should return GetKeyspaceVschemaNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getKeyspaceVschema({
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

      expect(result).toBeInstanceOf(GetKeyspaceVschemaNotfound);
      if (result instanceof GetKeyspaceVschemaNotfound) {
        expect(result._tag).toBe("GetKeyspaceVschemaNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetKeyspaceVschemaNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getKeyspaceVschema({
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

      expect(result).toBeInstanceOf(GetKeyspaceVschemaNotfound);
      if (result instanceof GetKeyspaceVschemaNotfound) {
        expect(result._tag).toBe("GetKeyspaceVschemaNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetKeyspaceVschemaNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getKeyspaceVschema({
        organization,
        database: "test", // Assuming a test database exists
        branch: "this-branch-definitely-does-not-exist-12345",
        keyspace: "test-keyspace",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetKeyspaceVschemaNotfound);
      if (result instanceof GetKeyspaceVschemaNotfound) {
        expect(result._tag).toBe("GetKeyspaceVschemaNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetKeyspaceVschemaNotfound for non-existent keyspace", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getKeyspaceVschema({
        organization,
        database: "test", // Assuming a test database exists
        branch: "main",
        keyspace: "this-keyspace-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetKeyspaceVschemaNotfound);
      if (result instanceof GetKeyspaceVschemaNotfound) {
        expect(result._tag).toBe("GetKeyspaceVschemaNotfound");
        expect(result.organization).toBe(organization);
        expect(result.keyspace).toBe("this-keyspace-definitely-does-not-exist-12345");
      }
    }),
  );
});
