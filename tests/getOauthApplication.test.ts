import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getOauthApplication,
  GetOauthApplicationForbidden,
  GetOauthApplicationInput,
  GetOauthApplicationNotfound,
  GetOauthApplicationOutput,
} from "../src/operations/getOauthApplication";
import { withMainLayer } from "./setup";

withMainLayer("getOauthApplication", (it) => {
  it("should have the correct input schema", () => {
    expect(GetOauthApplicationInput.fields.organization).toBeDefined();
    expect(GetOauthApplicationInput.fields.application_id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetOauthApplicationOutput.fields.id).toBeDefined();
    expect(GetOauthApplicationOutput.fields.name).toBeDefined();
    expect(GetOauthApplicationOutput.fields.redirect_uri).toBeDefined();
    expect(GetOauthApplicationOutput.fields.domain).toBeDefined();
    expect(GetOauthApplicationOutput.fields.created_at).toBeDefined();
    expect(GetOauthApplicationOutput.fields.updated_at).toBeDefined();
    expect(GetOauthApplicationOutput.fields.scopes).toBeDefined();
    expect(GetOauthApplicationOutput.fields.avatar).toBeDefined();
    expect(GetOauthApplicationOutput.fields.client_id).toBeDefined();
    expect(GetOauthApplicationOutput.fields.tokens).toBeDefined();
  });

  it.effect("should return GetOauthApplicationForbidden for non-existent application", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* getOauthApplication({
        organization,
        application_id: "this-application-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      // API returns forbidden when accessing an application that doesn't exist in your organization
      expect(result).toBeInstanceOf(GetOauthApplicationForbidden);
      if (result instanceof GetOauthApplicationForbidden) {
        expect(result._tag).toBe("GetOauthApplicationForbidden");
        expect(result.organization).toBe(organization);
        expect(result.application_id).toBe("this-application-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetOauthApplicationNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getOauthApplication({
        organization: "this-org-definitely-does-not-exist-12345",
        application_id: "some-application-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetOauthApplicationNotfound);
      if (result instanceof GetOauthApplicationNotfound) {
        expect(result._tag).toBe("GetOauthApplicationNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
        expect(result.application_id).toBe("some-application-id");
      }
    }),
  );
});
