import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  updateDatabaseSettings,
  UpdateDatabaseSettingsNotfound,
  UpdateDatabaseSettingsInput,
  UpdateDatabaseSettingsOutput,
} from "../src/operations/updateDatabaseSettings";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("updateDatabaseSettings", () => {
  it("should have the correct input schema", () => {
    expect(UpdateDatabaseSettingsInput.fields.organization).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.database).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.new_name).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.automatic_migrations).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.migration_framework).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.migration_table_name).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.require_approval_for_deploy).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.restrict_branch_region).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.allow_data_branching).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.allow_foreign_key_constraints).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.insights_raw_queries).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.production_branch_web_console).toBeDefined();
    expect(UpdateDatabaseSettingsInput.fields.default_branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateDatabaseSettingsOutput.fields.id).toBeDefined();
    expect(UpdateDatabaseSettingsOutput.fields.name).toBeDefined();
    expect(UpdateDatabaseSettingsOutput.fields.state).toBeDefined();
    expect(UpdateDatabaseSettingsOutput.fields.automatic_migrations).toBeDefined();
    expect(UpdateDatabaseSettingsOutput.fields.migration_framework).toBeDefined();
    expect(UpdateDatabaseSettingsOutput.fields.migration_table_name).toBeDefined();
    expect(UpdateDatabaseSettingsOutput.fields.require_approval_for_deploy).toBeDefined();
    expect(UpdateDatabaseSettingsOutput.fields.allow_data_branching).toBeDefined();
    expect(UpdateDatabaseSettingsOutput.fields.insights_raw_queries).toBeDefined();
    expect(UpdateDatabaseSettingsOutput.fields.production_branch_web_console).toBeDefined();
  });

  it.effect("should return UpdateDatabaseSettingsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* updateDatabaseSettings({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateDatabaseSettingsNotfound);
      if (result instanceof UpdateDatabaseSettingsNotfound) {
        expect(result._tag).toBe("UpdateDatabaseSettingsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdateDatabaseSettingsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateDatabaseSettings({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-db",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateDatabaseSettingsNotfound);
      if (result instanceof UpdateDatabaseSettingsNotfound) {
        expect(result._tag).toBe("UpdateDatabaseSettingsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
