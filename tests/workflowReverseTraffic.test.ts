import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  workflowReverseTraffic,
  WorkflowReverseTrafficNotfound,
  WorkflowReverseTrafficInput,
  WorkflowReverseTrafficOutput,
} from "../src/operations/workflowReverseTraffic";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("workflowReverseTraffic", () => {
  it("should have the correct input schema", () => {
    expect(WorkflowReverseTrafficInput.fields.organization).toBeDefined();
    expect(WorkflowReverseTrafficInput.fields.database).toBeDefined();
    expect(WorkflowReverseTrafficInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(WorkflowReverseTrafficOutput.fields.id).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.name).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.number).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.state).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.created_at).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.updated_at).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.started_at).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.completed_at).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.cancelled_at).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.workflow_type).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.workflow_subtype).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.defer_secondary_keys).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.on_ddl).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.actor).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.branch).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.source_keyspace).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.target_keyspace).toBeDefined();
    expect(WorkflowReverseTrafficOutput.fields.global_keyspace).toBeDefined();
  });

  it.effect("should return WorkflowReverseTrafficNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* workflowReverseTraffic({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowReverseTrafficNotfound);
      if (result instanceof WorkflowReverseTrafficNotfound) {
        expect(result._tag).toBe("WorkflowReverseTrafficNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return WorkflowReverseTrafficNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* workflowReverseTraffic({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowReverseTrafficNotfound);
      if (result instanceof WorkflowReverseTrafficNotfound) {
        expect(result._tag).toBe("WorkflowReverseTrafficNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
