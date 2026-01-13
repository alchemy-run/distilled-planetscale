import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  workflowRetry,
  WorkflowRetryNotfound,
  WorkflowRetryInput,
  WorkflowRetryOutput,
} from "../src/operations/workflowRetry";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("workflowRetry", () => {
  it("should have the correct input schema", () => {
    expect(WorkflowRetryInput.fields.organization).toBeDefined();
    expect(WorkflowRetryInput.fields.database).toBeDefined();
    expect(WorkflowRetryInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(WorkflowRetryOutput.fields.id).toBeDefined();
    expect(WorkflowRetryOutput.fields.name).toBeDefined();
    expect(WorkflowRetryOutput.fields.number).toBeDefined();
    expect(WorkflowRetryOutput.fields.state).toBeDefined();
    expect(WorkflowRetryOutput.fields.created_at).toBeDefined();
    expect(WorkflowRetryOutput.fields.updated_at).toBeDefined();
    expect(WorkflowRetryOutput.fields.started_at).toBeDefined();
    expect(WorkflowRetryOutput.fields.completed_at).toBeDefined();
    expect(WorkflowRetryOutput.fields.cancelled_at).toBeDefined();
    expect(WorkflowRetryOutput.fields.workflow_type).toBeDefined();
    expect(WorkflowRetryOutput.fields.workflow_subtype).toBeDefined();
    expect(WorkflowRetryOutput.fields.defer_secondary_keys).toBeDefined();
    expect(WorkflowRetryOutput.fields.on_ddl).toBeDefined();
    expect(WorkflowRetryOutput.fields.may_retry).toBeDefined();
    expect(WorkflowRetryOutput.fields.may_restart).toBeDefined();
    expect(WorkflowRetryOutput.fields.actor).toBeDefined();
    expect(WorkflowRetryOutput.fields.branch).toBeDefined();
    expect(WorkflowRetryOutput.fields.source_keyspace).toBeDefined();
    expect(WorkflowRetryOutput.fields.target_keyspace).toBeDefined();
    expect(WorkflowRetryOutput.fields.global_keyspace).toBeDefined();
  });

  it.effect("should return WorkflowRetryNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* workflowRetry({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowRetryNotfound);
      if (result instanceof WorkflowRetryNotfound) {
        expect(result._tag).toBe("WorkflowRetryNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return WorkflowRetryNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* workflowRetry({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowRetryNotfound);
      if (result instanceof WorkflowRetryNotfound) {
        expect(result._tag).toBe("WorkflowRetryNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
