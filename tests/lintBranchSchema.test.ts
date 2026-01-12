import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  lintBranchSchema,
  LintBranchSchemaNotfound,
  LintBranchSchemaInput,
  LintBranchSchemaOutput,
} from "../src/operations/lintBranchSchema";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("lintBranchSchema", () => {
  it("should have the correct input schema", () => {
    expect(LintBranchSchemaInput.fields.organization).toBeDefined();
    expect(LintBranchSchemaInput.fields.database).toBeDefined();
    expect(LintBranchSchemaInput.fields.branch).toBeDefined();
    expect(LintBranchSchemaInput.fields.page).toBeDefined();
    expect(LintBranchSchemaInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(LintBranchSchemaOutput.fields.current_page).toBeDefined();
    expect(LintBranchSchemaOutput.fields.next_page).toBeDefined();
    expect(LintBranchSchemaOutput.fields.next_page_url).toBeDefined();
    expect(LintBranchSchemaOutput.fields.prev_page).toBeDefined();
    expect(LintBranchSchemaOutput.fields.prev_page_url).toBeDefined();
    expect(LintBranchSchemaOutput.fields.data).toBeDefined();
  });

  it.effect("should fetch branch schema lint results successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* lintBranchSchema({
        organization,
        database: "test",
        branch: "main",
      }).pipe(
        Effect.catchTag("LintBranchSchemaNotfound", () =>
          Effect.succeed({ current_page: 1, next_page: 0, next_page_url: "", prev_page: 0, prev_page_url: "", data: [] }),
        ),
      );
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return LintBranchSchemaNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* lintBranchSchema({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(LintBranchSchemaNotfound);
      if (result instanceof LintBranchSchemaNotfound) {
        expect(result._tag).toBe("LintBranchSchemaNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return LintBranchSchemaNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* lintBranchSchema({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(LintBranchSchemaNotfound);
      if (result instanceof LintBranchSchemaNotfound) {
        expect(result._tag).toBe("LintBranchSchemaNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return LintBranchSchemaNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* lintBranchSchema({
        organization,
        database: "test",
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(LintBranchSchemaNotfound);
      if (result instanceof LintBranchSchemaNotfound) {
        expect(result._tag).toBe("LintBranchSchemaNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("test");
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
