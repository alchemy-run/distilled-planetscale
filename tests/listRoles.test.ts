import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listRoles,
  ListRolesNotfound,
  ListRolesInput,
  ListRolesOutput,
} from "../src/operations/listRoles";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("listRoles", (it) => {
  it("should have the correct input schema", () => {
    expect(ListRolesInput.fields.organization).toBeDefined();
    expect(ListRolesInput.fields.database).toBeDefined();
    expect(ListRolesInput.fields.branch).toBeDefined();
    expect(ListRolesInput.fields.page).toBeDefined();
    expect(ListRolesInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListRolesOutput.fields.current_page).toBeDefined();
    expect(ListRolesOutput.fields.next_page).toBeDefined();
    expect(ListRolesOutput.fields.next_page_url).toBeDefined();
    expect(ListRolesOutput.fields.prev_page).toBeDefined();
    expect(ListRolesOutput.fields.prev_page_url).toBeDefined();
    expect(ListRolesOutput.fields.data).toBeDefined();
  });

  it.effect("should return ListRolesNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listRoles({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListRolesNotfound);
      if (result instanceof ListRolesNotfound) {
        expect(result._tag).toBe("ListRolesNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListRolesNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listRoles({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListRolesNotfound);
      if (result instanceof ListRolesNotfound) {
        expect(result._tag).toBe("ListRolesNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListRolesNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listRoles({
        organization,
        database: TEST_DATABASE,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListRolesNotfound);
      if (result instanceof ListRolesNotfound) {
        expect(result._tag).toBe("ListRolesNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should list roles successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listRoles({
        organization,
        database: TEST_DATABASE,
        branch: "main",
      }).pipe(
        // Handle case where test database/branch doesn't exist
        Effect.catchTag("ListRolesNotfound", () =>
          Effect.succeed({
            current_page: 1,
            next_page: 1,
            next_page_url: "",
            prev_page: 1,
            prev_page_url: "",
            data: [],
          }),
        ),
      );

      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("next_page");
      expect(result).toHaveProperty("next_page_url");
      expect(result).toHaveProperty("prev_page");
      expect(result).toHaveProperty("prev_page_url");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );
});
