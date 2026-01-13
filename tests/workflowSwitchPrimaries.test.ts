import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  workflowSwitchPrimaries,
  WorkflowSwitchPrimariesNotfound,
  WorkflowSwitchPrimariesInput,
  WorkflowSwitchPrimariesOutput,
} from "../src/operations/workflowSwitchPrimaries";
import { withMainLayer } from "./setup";

withMainLayer("workflowSwitchPrimaries", (it) => {
  it("should have the correct input schema", () => {
    expect(WorkflowSwitchPrimariesInput.fields.organization).toBeDefined();
    expect(WorkflowSwitchPrimariesInput.fields.database).toBeDefined();
    expect(WorkflowSwitchPrimariesInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(WorkflowSwitchPrimariesOutput.fields.id).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.name).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.number).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.state).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.created_at).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.updated_at).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.started_at).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.completed_at).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.cancelled_at).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.workflow_type).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.workflow_subtype).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.defer_secondary_keys).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.on_ddl).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.actor).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.branch).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.source_keyspace).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.target_keyspace).toBeDefined();
    expect(WorkflowSwitchPrimariesOutput.fields.global_keyspace).toBeDefined();
  });

  it.effect("should return WorkflowSwitchPrimariesNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* workflowSwitchPrimaries({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowSwitchPrimariesNotfound);
      if (result instanceof WorkflowSwitchPrimariesNotfound) {
        expect(result._tag).toBe("WorkflowSwitchPrimariesNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return WorkflowSwitchPrimariesNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* workflowSwitchPrimaries({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowSwitchPrimariesNotfound);
      if (result instanceof WorkflowSwitchPrimariesNotfound) {
        expect(result._tag).toBe("WorkflowSwitchPrimariesNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );
});
