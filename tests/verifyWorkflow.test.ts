import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  verifyWorkflow,
  VerifyWorkflowNotfound,
  VerifyWorkflowInput,
  VerifyWorkflowOutput,
} from "../src/operations/verifyWorkflow";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("verifyWorkflow", () => {
  it("should have the correct input schema", () => {
    expect(VerifyWorkflowInput.fields.organization).toBeDefined();
    expect(VerifyWorkflowInput.fields.database).toBeDefined();
    expect(VerifyWorkflowInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(VerifyWorkflowOutput.fields.id).toBeDefined();
    expect(VerifyWorkflowOutput.fields.name).toBeDefined();
    expect(VerifyWorkflowOutput.fields.number).toBeDefined();
    expect(VerifyWorkflowOutput.fields.state).toBeDefined();
    expect(VerifyWorkflowOutput.fields.created_at).toBeDefined();
    expect(VerifyWorkflowOutput.fields.updated_at).toBeDefined();
    expect(VerifyWorkflowOutput.fields.started_at).toBeDefined();
    expect(VerifyWorkflowOutput.fields.completed_at).toBeDefined();
    expect(VerifyWorkflowOutput.fields.cancelled_at).toBeDefined();
    expect(VerifyWorkflowOutput.fields.workflow_type).toBeDefined();
    expect(VerifyWorkflowOutput.fields.workflow_subtype).toBeDefined();
    expect(VerifyWorkflowOutput.fields.defer_secondary_keys).toBeDefined();
    expect(VerifyWorkflowOutput.fields.on_ddl).toBeDefined();
    expect(VerifyWorkflowOutput.fields.actor).toBeDefined();
    expect(VerifyWorkflowOutput.fields.branch).toBeDefined();
    expect(VerifyWorkflowOutput.fields.source_keyspace).toBeDefined();
    expect(VerifyWorkflowOutput.fields.target_keyspace).toBeDefined();
    expect(VerifyWorkflowOutput.fields.global_keyspace).toBeDefined();
  });

  it.effect("should return VerifyWorkflowNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* verifyWorkflow({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(VerifyWorkflowNotfound);
      if (result instanceof VerifyWorkflowNotfound) {
        expect(result._tag).toBe("VerifyWorkflowNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return VerifyWorkflowNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* verifyWorkflow({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(VerifyWorkflowNotfound);
      if (result instanceof VerifyWorkflowNotfound) {
        expect(result._tag).toBe("VerifyWorkflowNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
