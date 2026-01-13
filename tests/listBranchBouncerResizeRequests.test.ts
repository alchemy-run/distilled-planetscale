import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listBranchBouncerResizeRequests,
  ListBranchBouncerResizeRequestsNotfound,
  ListBranchBouncerResizeRequestsInput,
  ListBranchBouncerResizeRequestsOutput,
} from "../src/operations/listBranchBouncerResizeRequests";
import { withMainLayer } from "./setup";

withMainLayer("listBranchBouncerResizeRequests", (it) => {
  it("should have the correct input schema", () => {
    expect(ListBranchBouncerResizeRequestsInput.fields.organization).toBeDefined();
    expect(ListBranchBouncerResizeRequestsInput.fields.database).toBeDefined();
    expect(ListBranchBouncerResizeRequestsInput.fields.branch).toBeDefined();
    expect(ListBranchBouncerResizeRequestsInput.fields.page).toBeDefined();
    expect(ListBranchBouncerResizeRequestsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListBranchBouncerResizeRequestsOutput.fields.current_page).toBeDefined();
    expect(ListBranchBouncerResizeRequestsOutput.fields.next_page).toBeDefined();
    expect(ListBranchBouncerResizeRequestsOutput.fields.next_page_url).toBeDefined();
    expect(ListBranchBouncerResizeRequestsOutput.fields.prev_page).toBeDefined();
    expect(ListBranchBouncerResizeRequestsOutput.fields.prev_page_url).toBeDefined();
    expect(ListBranchBouncerResizeRequestsOutput.fields.data).toBeDefined();
  });

  it.effect("should return ListBranchBouncerResizeRequestsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listBranchBouncerResizeRequests({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBranchBouncerResizeRequestsNotfound);
      if (result instanceof ListBranchBouncerResizeRequestsNotfound) {
        expect(result._tag).toBe("ListBranchBouncerResizeRequestsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListBranchBouncerResizeRequestsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listBranchBouncerResizeRequests({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBranchBouncerResizeRequestsNotfound);
      if (result instanceof ListBranchBouncerResizeRequestsNotfound) {
        expect(result._tag).toBe("ListBranchBouncerResizeRequestsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListBranchBouncerResizeRequestsNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* listBranchBouncerResizeRequests({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBranchBouncerResizeRequestsNotfound);
      if (result instanceof ListBranchBouncerResizeRequestsNotfound) {
        expect(result._tag).toBe("ListBranchBouncerResizeRequestsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );
});
