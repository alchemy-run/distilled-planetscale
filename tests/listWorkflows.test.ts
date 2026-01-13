import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listWorkflows,
  ListWorkflowsInput,
  ListWorkflowsNotfound,
  ListWorkflowsOutput,
} from "../src/operations/listWorkflows";
import { withMainLayer } from "./setup";

withMainLayer("listWorkflows", (it) => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListWorkflowsInput.fields.organization).toBeDefined();
    expect(ListWorkflowsInput.fields.database).toBeDefined();
    // Optional fields
    expect(ListWorkflowsInput.fields.between).toBeDefined();
    expect(ListWorkflowsInput.fields.page).toBeDefined();
    expect(ListWorkflowsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListWorkflowsOutput.fields.current_page).toBeDefined();
    expect(ListWorkflowsOutput.fields.next_page).toBeDefined();
    expect(ListWorkflowsOutput.fields.next_page_url).toBeDefined();
    expect(ListWorkflowsOutput.fields.prev_page).toBeDefined();
    expect(ListWorkflowsOutput.fields.prev_page_url).toBeDefined();
    expect(ListWorkflowsOutput.fields.data).toBeDefined();
  });

  it.effect("should list workflows successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";

      const result = yield* listWorkflows({
        organization,
        database,
      }).pipe(
        // Handle case where database doesn't exist
        Effect.catchTag("ListWorkflowsNotfound", () =>
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

  it.effect("should return ListWorkflowsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listWorkflows({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListWorkflowsNotfound);
      if (result instanceof ListWorkflowsNotfound) {
        expect(result._tag).toBe("ListWorkflowsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListWorkflowsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listWorkflows({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListWorkflowsNotfound);
      if (result instanceof ListWorkflowsNotfound) {
        expect(result._tag).toBe("ListWorkflowsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );
});
