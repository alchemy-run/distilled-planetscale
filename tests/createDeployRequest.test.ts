import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  createDeployRequest,
  CreateDeployRequestNotfound,
  CreateDeployRequestInput,
  CreateDeployRequestOutput,
} from "../src/operations/createDeployRequest";
import { withMainLayer } from "./setup";

withMainLayer("createDeployRequest", (it) => {
  it("should have the correct input schema", () => {
    expect(CreateDeployRequestInput.fields.organization).toBeDefined();
    expect(CreateDeployRequestInput.fields.database).toBeDefined();
    expect(CreateDeployRequestInput.fields.branch).toBeDefined();
    expect(CreateDeployRequestInput.fields.into_branch).toBeDefined();
    expect(CreateDeployRequestInput.fields.notes).toBeDefined();
    expect(CreateDeployRequestInput.fields.auto_cutover).toBeDefined();
    expect(CreateDeployRequestInput.fields.auto_delete_branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateDeployRequestOutput.fields.id).toBeDefined();
    expect(CreateDeployRequestOutput.fields.number).toBeDefined();
    expect(CreateDeployRequestOutput.fields.state).toBeDefined();
    expect(CreateDeployRequestOutput.fields.deployment_state).toBeDefined();
    expect(CreateDeployRequestOutput.fields.branch).toBeDefined();
    expect(CreateDeployRequestOutput.fields.into_branch).toBeDefined();
    expect(CreateDeployRequestOutput.fields.approved).toBeDefined();
    expect(CreateDeployRequestOutput.fields.notes).toBeDefined();
    expect(CreateDeployRequestOutput.fields.html_url).toBeDefined();
    expect(CreateDeployRequestOutput.fields.created_at).toBeDefined();
  });

  it.effect("should return CreateDeployRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createDeployRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "feature-branch",
        into_branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateDeployRequestNotfound);
      if (result instanceof CreateDeployRequestNotfound) {
        expect(result._tag).toBe("CreateDeployRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CreateDeployRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* createDeployRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "feature-branch",
        into_branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateDeployRequestNotfound);
      if (result instanceof CreateDeployRequestNotfound) {
        expect(result._tag).toBe("CreateDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CreateDeployRequestNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* createDeployRequest({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        into_branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateDeployRequestNotfound);
      if (result instanceof CreateDeployRequestNotfound) {
        expect(result._tag).toBe("CreateDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
      }
    }),
  );

  // Note: This test is skipped because creating deploy requests requires creating branches
  // and may incur costs. It also requires a database with safe migrations enabled.
  // When enabled, it demonstrates proper cleanup using Effect.ensuring.
  it.skip("should create a deploy request successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test"; // Replace with a test database that has safe migrations enabled
      const branch = "feature-branch"; // Replace with an existing branch

      const result = yield* createDeployRequest({
        organization,
        database,
        branch,
        into_branch: "main",
        notes: "Test deploy request",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("number");
      expect(result.branch).toBe(branch);
      expect(result.into_branch).toBe("main");
      expect(result.state).toBe("open");
      expect(result.notes).toBe("Test deploy request");
    }),
  );
});
