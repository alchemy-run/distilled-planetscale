import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  getCurrentUser,
  GetCurrentUserInput,
  GetCurrentUserOutput,
  GetCurrentUserUnauthorized,
} from "../src/operations/getCurrentUser";
import { withMainLayer } from "./setup";

withMainLayer("getCurrentUser", (it) => {
  it("should have the correct input schema", () => {
    // getCurrentUser has no input parameters
    expect(GetCurrentUserInput.fields).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetCurrentUserOutput.fields.id).toBeDefined();
    expect(GetCurrentUserOutput.fields.display_name).toBeDefined();
    expect(GetCurrentUserOutput.fields.name).toBeDefined();
    expect(GetCurrentUserOutput.fields.email).toBeDefined();
    expect(GetCurrentUserOutput.fields.avatar_url).toBeDefined();
    expect(GetCurrentUserOutput.fields.created_at).toBeDefined();
    expect(GetCurrentUserOutput.fields.updated_at).toBeDefined();
    expect(GetCurrentUserOutput.fields.two_factor_auth_configured).toBeDefined();
    expect(GetCurrentUserOutput.fields.default_organization).toBeDefined();
    expect(GetCurrentUserOutput.fields.sso).toBeDefined();
    expect(GetCurrentUserOutput.fields.managed).toBeDefined();
    expect(GetCurrentUserOutput.fields.directory_managed).toBeDefined();
    expect(GetCurrentUserOutput.fields.email_verified).toBeDefined();
  });

  it.effect("should fetch the current user or return unauthorized with service token", () =>
    Effect.gen(function* () {
      // Note: This endpoint requires OAuth user authentication.
      // Service tokens may return Unauthorized, which is expected behavior.
      const result = yield* getCurrentUser({}).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: (user) => Effect.succeed(user),
        }),
      );

      // Either we get a valid user response or an Unauthorized error
      if (result instanceof GetCurrentUserUnauthorized) {
        expect(result._tag).toBe("GetCurrentUserUnauthorized");
        expect(result.message).toBeDefined();
      } else {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("email");
        expect(result).toHaveProperty("display_name");
        expect(result).toHaveProperty("default_organization");
      }
    }),
  );
});
