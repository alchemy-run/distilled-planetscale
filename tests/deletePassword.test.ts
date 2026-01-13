import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  deletePassword,
  DeletePasswordNotfound,
  DeletePasswordInput,
  DeletePasswordOutput,
} from "../src/operations/deletePassword";
import { createPassword } from "../src/operations/createPassword";
import { withMainLayer } from "./setup";

withMainLayer("deletePassword", (it) => {
  it("should have the correct input schema", () => {
    expect(DeletePasswordInput.fields.organization).toBeDefined();
    expect(DeletePasswordInput.fields.database).toBeDefined();
    expect(DeletePasswordInput.fields.branch).toBeDefined();
    expect(DeletePasswordInput.fields.id).toBeDefined();
  });

  it("should have a void output schema", () => {
    // DeletePasswordOutput is Schema.Void
    expect(DeletePasswordOutput).toBeDefined();
  });

  it.effect("should return DeletePasswordNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deletePassword({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        id: "some-password-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeletePasswordNotfound);
      if (result instanceof DeletePasswordNotfound) {
        expect(result._tag).toBe("DeletePasswordNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeletePasswordNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* deletePassword({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        id: "some-password-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeletePasswordNotfound);
      if (result instanceof DeletePasswordNotfound) {
        expect(result._tag).toBe("DeletePasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeletePasswordNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
      const result = yield* deletePassword({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        id: "some-password-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeletePasswordNotfound);
      if (result instanceof DeletePasswordNotfound) {
        expect(result._tag).toBe("DeletePasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeletePasswordNotfound for non-existent password id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
      const branch = "main";
      const result = yield* deletePassword({
        organization,
        database,
        branch,
        id: "this-password-id-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeletePasswordNotfound);
      if (result instanceof DeletePasswordNotfound) {
        expect(result._tag).toBe("DeletePasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-password-id-definitely-does-not-exist-12345");
      }
    }),
  );

  // Note: This test creates an actual password and then deletes it.
  // It requires a valid database with a branch to exist.
  it.skip("should delete a password successfully", () => {
    // Use a test database name - adjust based on your PlanetScale setup
    const database = "test";
    const branch = "main";
    let createdPasswordId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a password to delete
      const password = yield* createPassword({
        organization,
        database,
        branch,
        name: `test-password-${Date.now()}`,
        role: "reader",
      });

      createdPasswordId = password.id;

      // Now delete it
      const result = yield* deletePassword({
        id: password.id,
        organization,
        database,
        branch,
      });

      // deletePassword returns void on success
      expect(result).toBeUndefined();
      createdPasswordId = undefined; // Clear so cleanup doesn't try to delete again
    }).pipe(
      // Ensure cleanup even if test assertions fail
      Effect.ensuring(
        Effect.gen(function* () {
          if (createdPasswordId) {
            const { organization } = yield* PlanetScaleCredentials;
            yield* deletePassword({
              id: createdPasswordId,
              organization,
              database,
              branch,
            }).pipe(Effect.ignore);
          }
        }),
      ),
      Effect.provide(MainLayer),
    );
  });
});
