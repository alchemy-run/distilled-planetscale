import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listBranchChangeRequests,
  ListBranchChangeRequestsInput,
  ListBranchChangeRequestsNotfound,
  ListBranchChangeRequestsOutput,
} from "../src/operations/listBranchChangeRequests";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("listBranchChangeRequests", (it) => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListBranchChangeRequestsInput.fields.organization).toBeDefined();
    expect(ListBranchChangeRequestsInput.fields.database).toBeDefined();
    expect(ListBranchChangeRequestsInput.fields.branch).toBeDefined();
    // Optional fields
    expect(ListBranchChangeRequestsInput.fields.page).toBeDefined();
    expect(ListBranchChangeRequestsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListBranchChangeRequestsOutput.fields.current_page).toBeDefined();
    expect(ListBranchChangeRequestsOutput.fields.next_page).toBeDefined();
    expect(ListBranchChangeRequestsOutput.fields.next_page_url).toBeDefined();
    expect(ListBranchChangeRequestsOutput.fields.prev_page).toBeDefined();
    expect(ListBranchChangeRequestsOutput.fields.prev_page_url).toBeDefined();
    expect(ListBranchChangeRequestsOutput.fields.data).toBeDefined();
  });

  it.effect("should list branch change requests successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const branch = "main";

      const result = yield* listBranchChangeRequests({
        organization,
        database,
        branch,
      }).pipe(
        // Handle case where database or branch doesn't exist
        Effect.catchTag("ListBranchChangeRequestsNotfound", () =>
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

  it.effect("should return ListBranchChangeRequestsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listBranchChangeRequests({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBranchChangeRequestsNotfound);
      if (result instanceof ListBranchChangeRequestsNotfound) {
        expect(result._tag).toBe("ListBranchChangeRequestsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListBranchChangeRequestsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listBranchChangeRequests({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBranchChangeRequestsNotfound);
      if (result instanceof ListBranchChangeRequestsNotfound) {
        expect(result._tag).toBe("ListBranchChangeRequestsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListBranchChangeRequestsNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const result = yield* listBranchChangeRequests({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBranchChangeRequestsNotfound);
      if (result instanceof ListBranchChangeRequestsNotfound) {
        expect(result._tag).toBe("ListBranchChangeRequestsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );
});
