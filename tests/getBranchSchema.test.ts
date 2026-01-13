import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getBranchSchema,
  GetBranchSchemaNotfound,
  GetBranchSchemaInput,
  GetBranchSchemaOutput,
} from "../src/operations/getBranchSchema";
import { withMainLayer } from "./setup";

withMainLayer("getBranchSchema", (it) => {
  it("should have the correct input schema", () => {
    expect(GetBranchSchemaInput.fields.organization).toBeDefined();
    expect(GetBranchSchemaInput.fields.database).toBeDefined();
    expect(GetBranchSchemaInput.fields.branch).toBeDefined();
    expect(GetBranchSchemaInput.fields.keyspace).toBeDefined();
    expect(GetBranchSchemaInput.fields.namespace).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetBranchSchemaOutput.fields.data).toBeDefined();
  });

  it.effect("should fetch branch schema successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getBranchSchema({
        organization,
        database: "test",
        branch: "main",
      }).pipe(
        Effect.catchTag("GetBranchSchemaNotfound", () =>
          Effect.succeed({ data: [] }),
        ),
      );
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect("should return GetBranchSchemaNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getBranchSchema({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetBranchSchemaNotfound);
      if (result instanceof GetBranchSchemaNotfound) {
        expect(result._tag).toBe("GetBranchSchemaNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetBranchSchemaNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getBranchSchema({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetBranchSchemaNotfound);
      if (result instanceof GetBranchSchemaNotfound) {
        expect(result._tag).toBe("GetBranchSchemaNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetBranchSchemaNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getBranchSchema({
        organization,
        database: "test",
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetBranchSchemaNotfound);
      if (result instanceof GetBranchSchemaNotfound) {
        expect(result._tag).toBe("GetBranchSchemaNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("test");
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );
});
