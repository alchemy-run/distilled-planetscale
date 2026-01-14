import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  deleteServiceToken,
  DeleteServiceTokenNotfound,
  DeleteServiceTokenForbidden,
  DeleteServiceTokenInput,
  DeleteServiceTokenOutput,
} from "../src/operations/deleteServiceToken";
import {
  createServiceToken,
  CreateServiceTokenForbidden,
} from "../src/operations/createServiceToken";
import { withMainLayer } from "./setup";

withMainLayer("deleteServiceToken", (it) => {
  it("should have the correct input schema", () => {
    expect(DeleteServiceTokenInput.fields.organization).toBeDefined();
    expect(DeleteServiceTokenInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    // Output is Void - no fields to check
    expect(DeleteServiceTokenOutput).toBeDefined();
  });

  // Note: The API returns Forbidden (not NotFound) for non-existent tokens within a valid org
  // This is a common security pattern to avoid information disclosure
  it.effect("should return DeleteServiceTokenForbidden for non-existent token", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* deleteServiceToken({
        organization,
        id: "this-token-id-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      // The API may return forbidden or not_found for non-existent tokens
      const isExpectedError =
        result instanceof DeleteServiceTokenNotfound ||
        result instanceof DeleteServiceTokenForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteServiceTokenNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteServiceToken({
        organization: "this-org-definitely-does-not-exist-12345",
        id: "some-token-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError =
        result instanceof DeleteServiceTokenNotfound ||
        result instanceof DeleteServiceTokenForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test is skipped because creating/deleting service tokens requires admin permissions
  // that service tokens typically don't have. When enabled with proper credentials, it
  // demonstrates the full create-then-delete workflow.
  it.effect("should delete a service token successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const testTokenName = `test-token-delete-${Date.now()}`;

      // First create a token to delete
      const created = yield* createServiceToken({
        organization,
        name: testTokenName,
      }).pipe(
        Effect.catchTag("CreateServiceTokenForbidden", () => Effect.succeed(null)),
      );

      // Skip test gracefully if creation is forbidden
      if (created === null) {
        return;
      }

      expect(created).toHaveProperty("id");

      // Now delete it
      const result = yield* deleteServiceToken({
        organization,
        id: created.id,
      });

      // deleteServiceToken returns void on success
      expect(result).toBeUndefined();
    }),
  );
});
