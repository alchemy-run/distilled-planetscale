import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  getWorkflow,
  GetWorkflowNotfound,
  GetWorkflowInput,
  GetWorkflowOutput,
} from "../src/operations/getWorkflow";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("getWorkflow", () => {
  it("should have the correct input schema", () => {
    expect(GetWorkflowInput.fields.organization).toBeDefined();
    expect(GetWorkflowInput.fields.database).toBeDefined();
    expect(GetWorkflowInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetWorkflowOutput.fields.id).toBeDefined();
    expect(GetWorkflowOutput.fields.name).toBeDefined();
    expect(GetWorkflowOutput.fields.number).toBeDefined();
    expect(GetWorkflowOutput.fields.state).toBeDefined();
    expect(GetWorkflowOutput.fields.created_at).toBeDefined();
    expect(GetWorkflowOutput.fields.updated_at).toBeDefined();
    expect(GetWorkflowOutput.fields.started_at).toBeDefined();
    expect(GetWorkflowOutput.fields.completed_at).toBeDefined();
    expect(GetWorkflowOutput.fields.cancelled_at).toBeDefined();
    expect(GetWorkflowOutput.fields.workflow_type).toBeDefined();
    expect(GetWorkflowOutput.fields.workflow_subtype).toBeDefined();
    expect(GetWorkflowOutput.fields.defer_secondary_keys).toBeDefined();
    expect(GetWorkflowOutput.fields.on_ddl).toBeDefined();
    expect(GetWorkflowOutput.fields.actor).toBeDefined();
    expect(GetWorkflowOutput.fields.branch).toBeDefined();
    expect(GetWorkflowOutput.fields.source_keyspace).toBeDefined();
    expect(GetWorkflowOutput.fields.target_keyspace).toBeDefined();
    expect(GetWorkflowOutput.fields.global_keyspace).toBeDefined();
  });

  it.effect("should return GetWorkflowNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getWorkflow({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetWorkflowNotfound);
      if (result instanceof GetWorkflowNotfound) {
        expect(result._tag).toBe("GetWorkflowNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return GetWorkflowNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getWorkflow({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetWorkflowNotfound);
      if (result instanceof GetWorkflowNotfound) {
        expect(result._tag).toBe("GetWorkflowNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
