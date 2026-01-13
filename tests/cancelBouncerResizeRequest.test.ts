import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  cancelBouncerResizeRequest,
  CancelBouncerResizeRequestNotfound,
  CancelBouncerResizeRequestInput,
  CancelBouncerResizeRequestOutput,
} from "../src/operations/cancelBouncerResizeRequest";
import { withMainLayer } from "./setup";

withMainLayer("cancelBouncerResizeRequest", (it) => {
  it("should have the correct input schema", () => {
    expect(CancelBouncerResizeRequestInput.fields.organization).toBeDefined();
    expect(CancelBouncerResizeRequestInput.fields.database).toBeDefined();
    expect(CancelBouncerResizeRequestInput.fields.branch).toBeDefined();
    expect(CancelBouncerResizeRequestInput.fields.bouncer).toBeDefined();
  });

  it("should have a void output schema", () => {
    // CancelBouncerResizeRequestOutput is Schema.Void
    expect(CancelBouncerResizeRequestOutput).toBeDefined();
  });

  it.effect("should return CancelBouncerResizeRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* cancelBouncerResizeRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        bouncer: "some-bouncer-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CancelBouncerResizeRequestNotfound);
      if (result instanceof CancelBouncerResizeRequestNotfound) {
        expect(result._tag).toBe("CancelBouncerResizeRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CancelBouncerResizeRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* cancelBouncerResizeRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        bouncer: "some-bouncer-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CancelBouncerResizeRequestNotfound);
      if (result instanceof CancelBouncerResizeRequestNotfound) {
        expect(result._tag).toBe("CancelBouncerResizeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CancelBouncerResizeRequestNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
      const result = yield* cancelBouncerResizeRequest({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        bouncer: "some-bouncer-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CancelBouncerResizeRequestNotfound);
      if (result instanceof CancelBouncerResizeRequestNotfound) {
        expect(result._tag).toBe("CancelBouncerResizeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CancelBouncerResizeRequestNotfound for non-existent bouncer", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
      const branch = "main";
      const result = yield* cancelBouncerResizeRequest({
        organization,
        database,
        branch,
        bouncer: "this-bouncer-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CancelBouncerResizeRequestNotfound);
      if (result instanceof CancelBouncerResizeRequestNotfound) {
        expect(result._tag).toBe("CancelBouncerResizeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.bouncer).toBe("this-bouncer-definitely-does-not-exist-12345");
      }
    }),
  );
});
