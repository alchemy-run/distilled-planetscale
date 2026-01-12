import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  deleteServiceToken,
  DeleteServiceTokenNotfound,
  DeleteServiceTokenForbidden,
  DeleteServiceTokenInput,
  DeleteServiceTokenOutput,
} from "../src/operations/deleteServiceToken";
import { createServiceToken } from "../src/operations/createServiceToken";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("deleteServiceToken", () => {
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
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* deleteServiceToken({
        organization,
        id: "this-token-id-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteServiceTokenForbidden);
      if (result instanceof DeleteServiceTokenForbidden) {
        expect(result._tag).toBe("DeleteServiceTokenForbidden");
        expect(result.organization).toBe(organization);
        expect(result.id).toBe("this-token-id-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
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

      expect(result).toBeInstanceOf(DeleteServiceTokenNotfound);
      if (result instanceof DeleteServiceTokenNotfound) {
        expect(result._tag).toBe("DeleteServiceTokenNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because creating/deleting service tokens requires admin permissions
  // that service tokens typically don't have. When enabled with proper credentials, it
  // demonstrates the full create-then-delete workflow.
  it.skip("should delete a service token successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const testTokenName = `test-token-delete-${Date.now()}`;

      // First create a token to delete
      const created = yield* createServiceToken({
        organization,
        name: testTokenName,
      });

      expect(created).toHaveProperty("id");

      // Now delete it
      const result = yield* deleteServiceToken({
        organization,
        id: created.id,
      });

      // deleteServiceToken returns void on success
      expect(result).toBeUndefined();
    }).pipe(Effect.provide(MainLayer)),
  );
});
