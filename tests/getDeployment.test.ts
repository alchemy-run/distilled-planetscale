import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  getDeployment,
  GetDeploymentNotfound,
  GetDeploymentInput,
  GetDeploymentOutput,
} from "../src/operations/getDeployment";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getDeployment", (it) => {
  it("should have the correct input schema", () => {
    expect(GetDeploymentInput.fields.organization).toBeDefined();
    expect(GetDeploymentInput.fields.database).toBeDefined();
    expect(GetDeploymentInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetDeploymentOutput.fields.id).toBeDefined();
    expect(GetDeploymentOutput.fields.state).toBeDefined();
    expect(GetDeploymentOutput.fields.auto_cutover).toBeDefined();
    expect(GetDeploymentOutput.fields.auto_delete_branch).toBeDefined();
    expect(GetDeploymentOutput.fields.created_at).toBeDefined();
    expect(GetDeploymentOutput.fields.deploy_request_number).toBeDefined();
    expect(GetDeploymentOutput.fields.deployable).toBeDefined();
    expect(GetDeploymentOutput.fields.into_branch).toBeDefined();
    expect(GetDeploymentOutput.fields.deploy_operations).toBeDefined();
  });

  it.effect("should return GetDeploymentNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getDeployment({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDeploymentNotfound);
      if (result instanceof GetDeploymentNotfound) {
        expect(result._tag).toBe("GetDeploymentNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetDeploymentNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getDeployment({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDeploymentNotfound);
      if (result instanceof GetDeploymentNotfound) {
        expect(result._tag).toBe("GetDeploymentNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetDeploymentNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* getDeployment({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDeploymentNotfound);
      if (result instanceof GetDeploymentNotfound) {
        expect(result._tag).toBe("GetDeploymentNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }),
  );
});
