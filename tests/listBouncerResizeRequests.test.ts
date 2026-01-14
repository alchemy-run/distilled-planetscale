import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  listBouncerResizeRequests,
  ListBouncerResizeRequestsNotfound,
  ListBouncerResizeRequestsInput,
  ListBouncerResizeRequestsOutput,
} from "../src/operations/listBouncerResizeRequests";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("listBouncerResizeRequests", (it) => {
  it("should have the correct input schema", () => {
    expect(ListBouncerResizeRequestsInput.fields.organization).toBeDefined();
    expect(ListBouncerResizeRequestsInput.fields.database).toBeDefined();
    expect(ListBouncerResizeRequestsInput.fields.branch).toBeDefined();
    expect(ListBouncerResizeRequestsInput.fields.bouncer).toBeDefined();
    expect(ListBouncerResizeRequestsInput.fields.page).toBeDefined();
    expect(ListBouncerResizeRequestsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListBouncerResizeRequestsOutput.fields.current_page).toBeDefined();
    expect(ListBouncerResizeRequestsOutput.fields.next_page).toBeDefined();
    expect(ListBouncerResizeRequestsOutput.fields.next_page_url).toBeDefined();
    expect(ListBouncerResizeRequestsOutput.fields.prev_page).toBeDefined();
    expect(ListBouncerResizeRequestsOutput.fields.prev_page_url).toBeDefined();
    expect(ListBouncerResizeRequestsOutput.fields.data).toBeDefined();
  });

  it.effect("should return ListBouncerResizeRequestsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listBouncerResizeRequests({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        bouncer: "some-bouncer-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBouncerResizeRequestsNotfound);
      if (result instanceof ListBouncerResizeRequestsNotfound) {
        expect(result._tag).toBe("ListBouncerResizeRequestsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListBouncerResizeRequestsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* listBouncerResizeRequests({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        bouncer: "some-bouncer-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBouncerResizeRequestsNotfound);
      if (result instanceof ListBouncerResizeRequestsNotfound) {
        expect(result._tag).toBe("ListBouncerResizeRequestsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListBouncerResizeRequestsNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* listBouncerResizeRequests({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        bouncer: "some-bouncer-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBouncerResizeRequestsNotfound);
      if (result instanceof ListBouncerResizeRequestsNotfound) {
        expect(result._tag).toBe("ListBouncerResizeRequestsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListBouncerResizeRequestsNotfound for non-existent bouncer", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const branch = "main";
      const result = yield* listBouncerResizeRequests({
        organization,
        database,
        branch,
        bouncer: "this-bouncer-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBouncerResizeRequestsNotfound);
      if (result instanceof ListBouncerResizeRequestsNotfound) {
        expect(result._tag).toBe("ListBouncerResizeRequestsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.bouncer).toBe("this-bouncer-definitely-does-not-exist-12345");
      }
    }),
  );
});
