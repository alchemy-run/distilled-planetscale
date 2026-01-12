import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  workflowCancel,
  WorkflowCancelNotfound,
  WorkflowCancelInput,
  WorkflowCancelOutput,
} from "../src/operations/workflowCancel";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("workflowCancel", () => {
  it("should have the correct input schema", () => {
    expect(WorkflowCancelInput.fields.organization).toBeDefined();
    expect(WorkflowCancelInput.fields.database).toBeDefined();
    expect(WorkflowCancelInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(WorkflowCancelOutput.fields.id).toBeDefined();
    expect(WorkflowCancelOutput.fields.name).toBeDefined();
    expect(WorkflowCancelOutput.fields.number).toBeDefined();
    expect(WorkflowCancelOutput.fields.state).toBeDefined();
    expect(WorkflowCancelOutput.fields.created_at).toBeDefined();
    expect(WorkflowCancelOutput.fields.updated_at).toBeDefined();
    expect(WorkflowCancelOutput.fields.started_at).toBeDefined();
    expect(WorkflowCancelOutput.fields.completed_at).toBeDefined();
    expect(WorkflowCancelOutput.fields.cancelled_at).toBeDefined();
    expect(WorkflowCancelOutput.fields.workflow_type).toBeDefined();
    expect(WorkflowCancelOutput.fields.workflow_subtype).toBeDefined();
    expect(WorkflowCancelOutput.fields.defer_secondary_keys).toBeDefined();
    expect(WorkflowCancelOutput.fields.on_ddl).toBeDefined();
    expect(WorkflowCancelOutput.fields.actor).toBeDefined();
    expect(WorkflowCancelOutput.fields.branch).toBeDefined();
    expect(WorkflowCancelOutput.fields.source_keyspace).toBeDefined();
    expect(WorkflowCancelOutput.fields.target_keyspace).toBeDefined();
    expect(WorkflowCancelOutput.fields.global_keyspace).toBeDefined();
  });

  it.effect("should return WorkflowCancelNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* workflowCancel({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowCancelNotfound);
      if (result instanceof WorkflowCancelNotfound) {
        expect(result._tag).toBe("WorkflowCancelNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return WorkflowCancelNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* workflowCancel({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowCancelNotfound);
      if (result instanceof WorkflowCancelNotfound) {
        expect(result._tag).toBe("WorkflowCancelNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
