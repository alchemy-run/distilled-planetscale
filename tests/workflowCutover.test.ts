import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  workflowCutover,
  WorkflowCutoverNotfound,
  WorkflowCutoverInput,
  WorkflowCutoverOutput,
} from "../src/operations/workflowCutover";
import { withMainLayer } from "./setup";

withMainLayer("workflowCutover", (it) => {
  it("should have the correct input schema", () => {
    expect(WorkflowCutoverInput.fields.organization).toBeDefined();
    expect(WorkflowCutoverInput.fields.database).toBeDefined();
    expect(WorkflowCutoverInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(WorkflowCutoverOutput.fields.id).toBeDefined();
    expect(WorkflowCutoverOutput.fields.name).toBeDefined();
    expect(WorkflowCutoverOutput.fields.number).toBeDefined();
    expect(WorkflowCutoverOutput.fields.state).toBeDefined();
    expect(WorkflowCutoverOutput.fields.created_at).toBeDefined();
    expect(WorkflowCutoverOutput.fields.updated_at).toBeDefined();
    expect(WorkflowCutoverOutput.fields.started_at).toBeDefined();
    expect(WorkflowCutoverOutput.fields.completed_at).toBeDefined();
    expect(WorkflowCutoverOutput.fields.cancelled_at).toBeDefined();
    expect(WorkflowCutoverOutput.fields.workflow_type).toBeDefined();
    expect(WorkflowCutoverOutput.fields.workflow_subtype).toBeDefined();
    expect(WorkflowCutoverOutput.fields.defer_secondary_keys).toBeDefined();
    expect(WorkflowCutoverOutput.fields.on_ddl).toBeDefined();
    expect(WorkflowCutoverOutput.fields.actor).toBeDefined();
    expect(WorkflowCutoverOutput.fields.branch).toBeDefined();
    expect(WorkflowCutoverOutput.fields.source_keyspace).toBeDefined();
    expect(WorkflowCutoverOutput.fields.target_keyspace).toBeDefined();
    expect(WorkflowCutoverOutput.fields.global_keyspace).toBeDefined();
  });

  it.effect("should return WorkflowCutoverNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* workflowCutover({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowCutoverNotfound);
      if (result instanceof WorkflowCutoverNotfound) {
        expect(result._tag).toBe("WorkflowCutoverNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return WorkflowCutoverNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* workflowCutover({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowCutoverNotfound);
      if (result instanceof WorkflowCutoverNotfound) {
        expect(result._tag).toBe("WorkflowCutoverNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );
});
