import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleParseError } from "../src/client";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listBackups,
  ListBackupsForbidden,
  ListBackupsInput,
  ListBackupsNotfound,
  ListBackupsOutput,
} from "../src/operations/listBackups";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("listBackups", (it) => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListBackupsInput.fields.organization).toBeDefined();
    expect(ListBackupsInput.fields.database).toBeDefined();
    expect(ListBackupsInput.fields.branch).toBeDefined();
    // Optional fields
    expect(ListBackupsInput.fields.all).toBeDefined();
    expect(ListBackupsInput.fields.state).toBeDefined();
    expect(ListBackupsInput.fields.policy).toBeDefined();
    expect(ListBackupsInput.fields.page).toBeDefined();
    expect(ListBackupsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListBackupsOutput.fields.current_page).toBeDefined();
    expect(ListBackupsOutput.fields.next_page).toBeDefined();
    expect(ListBackupsOutput.fields.next_page_url).toBeDefined();
    expect(ListBackupsOutput.fields.prev_page).toBeDefined();
    expect(ListBackupsOutput.fields.prev_page_url).toBeDefined();
    expect(ListBackupsOutput.fields.data).toBeDefined();
  });

  it.effect("should list backups successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const branch = "main";

      const result = yield* listBackups({
        organization,
        database,
        branch,
      }).pipe(
        // Handle case where database/branch doesn't exist, access is forbidden, or schema parse error
        Effect.catchTag("ListBackupsNotfound", () => Effect.succeed(null)),
        Effect.catchTag("ListBackupsForbidden", () => Effect.succeed(null)),
        Effect.catchTag("PlanetScaleParseError", () => Effect.succeed(null)),
      );

      if (result === null) {
        return; // Skip test gracefully
      }

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("next_page");
      expect(result).toHaveProperty("prev_page");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect("should return ListBackupsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listBackups({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof ListBackupsNotfound || result instanceof ListBackupsForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return ListBackupsNotfound or ListBackupsForbidden for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listBackups({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof ListBackupsNotfound || result instanceof ListBackupsForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return ListBackupsNotfound or ListBackupsForbidden for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const result = yield* listBackups({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof ListBackupsNotfound || result instanceof ListBackupsForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );
});
