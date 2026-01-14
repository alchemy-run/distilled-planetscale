import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  deleteOauthToken,
  DeleteOauthTokenNotfound,
  DeleteOauthTokenForbidden,
  DeleteOauthTokenInput,
  DeleteOauthTokenOutput,
} from "../src/operations/deleteOauthToken";
import { withMainLayer } from "./setup";

withMainLayer("deleteOauthToken", (it) => {
  it("should have the correct input schema", () => {
    expect(DeleteOauthTokenInput.fields.organization).toBeDefined();
    expect(DeleteOauthTokenInput.fields.application_id).toBeDefined();
    expect(DeleteOauthTokenInput.fields.token_id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    // Output is Schema.Void for DELETE operations
    expect(DeleteOauthTokenOutput).toBeDefined();
  });

  it.effect("should return DeleteOauthTokenNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteOauthToken({
        organization: "this-org-definitely-does-not-exist-12345",
        application_id: "fake-oauth-app-id",
        token_id: "fake-token-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteOauthTokenNotfound);
      if (result instanceof DeleteOauthTokenNotfound) {
        expect(result._tag).toBe("DeleteOauthTokenNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeleteOauthTokenForbidden for non-existent OAuth application", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* deleteOauthToken({
        organization,
        application_id: "this-oauth-app-definitely-does-not-exist-12345",
        token_id: "fake-token-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteOauthTokenForbidden);
      if (result instanceof DeleteOauthTokenForbidden) {
        expect(result._tag).toBe("DeleteOauthTokenForbidden");
        expect(result.organization).toBe(organization);
        expect(result.application_id).toBe("this-oauth-app-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeleteOauthTokenForbidden for non-existent token", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* deleteOauthToken({
        organization,
        application_id: "fake-oauth-app-id",
        token_id: "this-token-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteOauthTokenForbidden);
      if (result instanceof DeleteOauthTokenForbidden) {
        expect(result._tag).toBe("DeleteOauthTokenForbidden");
        expect(result.organization).toBe(organization);
        expect(result.token_id).toBe("this-token-definitely-does-not-exist-12345");
      }
    }),
  );
});
