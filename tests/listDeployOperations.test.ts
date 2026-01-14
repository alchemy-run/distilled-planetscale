import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  listDeployOperations,
  ListDeployOperationsNotfound,
  ListDeployOperationsInput,
  ListDeployOperationsOutput,
} from "../src/operations/listDeployOperations";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("listDeployOperations", (it) => {
  it("should have the correct input schema", () => {
    expect(ListDeployOperationsInput.fields.organization).toBeDefined();
    expect(ListDeployOperationsInput.fields.database).toBeDefined();
    expect(ListDeployOperationsInput.fields.number).toBeDefined();
    expect(ListDeployOperationsInput.fields.page).toBeDefined();
    expect(ListDeployOperationsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListDeployOperationsOutput.fields.current_page).toBeDefined();
    expect(ListDeployOperationsOutput.fields.next_page).toBeDefined();
    expect(ListDeployOperationsOutput.fields.next_page_url).toBeDefined();
    expect(ListDeployOperationsOutput.fields.prev_page).toBeDefined();
    expect(ListDeployOperationsOutput.fields.prev_page_url).toBeDefined();
    expect(ListDeployOperationsOutput.fields.data).toBeDefined();
  });

  it.effect("should return ListDeployOperationsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listDeployOperations({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDeployOperationsNotfound);
      if (result instanceof ListDeployOperationsNotfound) {
        expect(result._tag).toBe("ListDeployOperationsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListDeployOperationsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* listDeployOperations({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDeployOperationsNotfound);
      if (result instanceof ListDeployOperationsNotfound) {
        expect(result._tag).toBe("ListDeployOperationsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListDeployOperationsNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* listDeployOperations({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDeployOperationsNotfound);
      if (result instanceof ListDeployOperationsNotfound) {
        expect(result._tag).toBe("ListDeployOperationsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }),
  );
});
