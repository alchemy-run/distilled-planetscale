import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  getDeployRequest,
  GetDeployRequestNotfound,
  GetDeployRequestInput,
  GetDeployRequestOutput,
} from "../src/operations/getDeployRequest";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getDeployRequest", (it) => {
  it("should have the correct input schema", () => {
    expect(GetDeployRequestInput.fields.organization).toBeDefined();
    expect(GetDeployRequestInput.fields.database).toBeDefined();
    expect(GetDeployRequestInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetDeployRequestOutput.fields.id).toBeDefined();
    expect(GetDeployRequestOutput.fields.number).toBeDefined();
    expect(GetDeployRequestOutput.fields.state).toBeDefined();
    expect(GetDeployRequestOutput.fields.deployment_state).toBeDefined();
    expect(GetDeployRequestOutput.fields.branch).toBeDefined();
    expect(GetDeployRequestOutput.fields.into_branch).toBeDefined();
    expect(GetDeployRequestOutput.fields.approved).toBeDefined();
    expect(GetDeployRequestOutput.fields.notes).toBeDefined();
    expect(GetDeployRequestOutput.fields.html_url).toBeDefined();
    expect(GetDeployRequestOutput.fields.created_at).toBeDefined();
  });

  it.effect("should return GetDeployRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getDeployRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDeployRequestNotfound);
      if (result instanceof GetDeployRequestNotfound) {
        expect(result._tag).toBe("GetDeployRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetDeployRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getDeployRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDeployRequestNotfound);
      if (result instanceof GetDeployRequestNotfound) {
        expect(result._tag).toBe("GetDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetDeployRequestNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* getDeployRequest({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDeployRequestNotfound);
      if (result instanceof GetDeployRequestNotfound) {
        expect(result._tag).toBe("GetDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }),
  );
});
