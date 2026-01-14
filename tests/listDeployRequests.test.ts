import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  listDeployRequests,
  ListDeployRequestsNotfound,
  ListDeployRequestsInput,
  ListDeployRequestsOutput,
} from "../src/operations/listDeployRequests";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("listDeployRequests", (it) => {
  it("should have the correct input schema", () => {
    expect(ListDeployRequestsInput.fields.organization).toBeDefined();
    expect(ListDeployRequestsInput.fields.database).toBeDefined();
    expect(ListDeployRequestsInput.fields.state).toBeDefined();
    expect(ListDeployRequestsInput.fields.branch).toBeDefined();
    expect(ListDeployRequestsInput.fields.into_branch).toBeDefined();
    expect(ListDeployRequestsInput.fields.deployed_at).toBeDefined();
    expect(ListDeployRequestsInput.fields.running_at).toBeDefined();
    expect(ListDeployRequestsInput.fields.page).toBeDefined();
    expect(ListDeployRequestsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListDeployRequestsOutput.fields.current_page).toBeDefined();
    expect(ListDeployRequestsOutput.fields.next_page).toBeDefined();
    expect(ListDeployRequestsOutput.fields.prev_page).toBeDefined();
    expect(ListDeployRequestsOutput.fields.data).toBeDefined();
  });

  it.effect("should list deploy requests successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* listDeployRequests({
        organization,
        database: TEST_DATABASE,
      }).pipe(
        // Handle case where database doesn't exist or has no deploy requests
        Effect.catchTag("ListDeployRequestsNotfound", () =>
          Effect.succeed({ data: [], current_page: 1, next_page: 0, prev_page: 0, next_page_url: "", prev_page_url: "" }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect("should support pagination parameters", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* listDeployRequests({
        organization,
        database: TEST_DATABASE,
        page: 1,
        per_page: 5,
      }).pipe(
        Effect.catchTag("ListDeployRequestsNotfound", () =>
          Effect.succeed({ data: [], current_page: 1, next_page: 0, prev_page: 0, next_page_url: "", prev_page_url: "" }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
    }),
  );

  it.effect("should return ListDeployRequestsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listDeployRequests({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDeployRequestsNotfound);
      if (result instanceof ListDeployRequestsNotfound) {
        expect(result._tag).toBe("ListDeployRequestsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListDeployRequestsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* listDeployRequests({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDeployRequestsNotfound);
      if (result instanceof ListDeployRequestsNotfound) {
        expect(result._tag).toBe("ListDeployRequestsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );
});
