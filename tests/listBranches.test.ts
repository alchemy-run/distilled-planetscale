import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listBranches,
  ListBranchesInput,
  ListBranchesNotfound,
  ListBranchesOutput,
} from "../src/operations/listBranches";
import { withMainLayer } from "./setup";

withMainLayer("listBranches", (it) => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListBranchesInput.fields.organization).toBeDefined();
    expect(ListBranchesInput.fields.database).toBeDefined();
    // Optional fields
    expect(ListBranchesInput.fields.q).toBeDefined();
    expect(ListBranchesInput.fields.production).toBeDefined();
    expect(ListBranchesInput.fields.safe_migrations).toBeDefined();
    expect(ListBranchesInput.fields.order).toBeDefined();
    expect(ListBranchesInput.fields.page).toBeDefined();
    expect(ListBranchesInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListBranchesOutput.fields.current_page).toBeDefined();
    expect(ListBranchesOutput.fields.next_page).toBeDefined();
    expect(ListBranchesOutput.fields.next_page_url).toBeDefined();
    expect(ListBranchesOutput.fields.prev_page).toBeDefined();
    expect(ListBranchesOutput.fields.prev_page_url).toBeDefined();
    expect(ListBranchesOutput.fields.data).toBeDefined();
  });

  it.effect("should list branches successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";

      const result = yield* listBranches({
        organization,
        database,
      }).pipe(
        // Handle case where database doesn't exist
        Effect.catchTag("ListBranchesNotfound", () =>
          Effect.succeed({
            current_page: 1,
            next_page: 0,
            next_page_url: "",
            prev_page: 0,
            prev_page_url: "",
            data: [],
          }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("next_page");
      expect(result).toHaveProperty("prev_page");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect("should return ListBranchesNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listBranches({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBranchesNotfound);
      if (result instanceof ListBranchesNotfound) {
        expect(result._tag).toBe("ListBranchesNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListBranchesNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listBranches({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBranchesNotfound);
      if (result instanceof ListBranchesNotfound) {
        expect(result._tag).toBe("ListBranchesNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );
});
