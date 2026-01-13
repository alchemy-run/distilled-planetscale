import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  workflowComplete,
  WorkflowCompleteNotfound,
  WorkflowCompleteInput,
  WorkflowCompleteOutput,
} from "../src/operations/workflowComplete";
import { withMainLayer } from "./setup";

withMainLayer("workflowComplete", (it) => {
  it("should have the correct input schema", () => {
    expect(WorkflowCompleteInput.fields.organization).toBeDefined();
    expect(WorkflowCompleteInput.fields.database).toBeDefined();
    expect(WorkflowCompleteInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(WorkflowCompleteOutput.fields.id).toBeDefined();
    expect(WorkflowCompleteOutput.fields.name).toBeDefined();
    expect(WorkflowCompleteOutput.fields.number).toBeDefined();
    expect(WorkflowCompleteOutput.fields.state).toBeDefined();
    expect(WorkflowCompleteOutput.fields.created_at).toBeDefined();
    expect(WorkflowCompleteOutput.fields.updated_at).toBeDefined();
    expect(WorkflowCompleteOutput.fields.started_at).toBeDefined();
    expect(WorkflowCompleteOutput.fields.completed_at).toBeDefined();
    expect(WorkflowCompleteOutput.fields.cancelled_at).toBeDefined();
    expect(WorkflowCompleteOutput.fields.workflow_type).toBeDefined();
    expect(WorkflowCompleteOutput.fields.workflow_subtype).toBeDefined();
    expect(WorkflowCompleteOutput.fields.defer_secondary_keys).toBeDefined();
    expect(WorkflowCompleteOutput.fields.on_ddl).toBeDefined();
    expect(WorkflowCompleteOutput.fields.actor).toBeDefined();
    expect(WorkflowCompleteOutput.fields.branch).toBeDefined();
    expect(WorkflowCompleteOutput.fields.source_keyspace).toBeDefined();
    expect(WorkflowCompleteOutput.fields.target_keyspace).toBeDefined();
    expect(WorkflowCompleteOutput.fields.global_keyspace).toBeDefined();
  });

  it.effect("should return WorkflowCompleteNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* workflowComplete({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowCompleteNotfound);
      if (result instanceof WorkflowCompleteNotfound) {
        expect(result._tag).toBe("WorkflowCompleteNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return WorkflowCompleteNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* workflowComplete({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowCompleteNotfound);
      if (result instanceof WorkflowCompleteNotfound) {
        expect(result._tag).toBe("WorkflowCompleteNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );
});
