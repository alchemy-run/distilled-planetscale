import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  listOauthTokens,
  ListOauthTokensForbidden,
  ListOauthTokensInput,
  ListOauthTokensNotfound,
  ListOauthTokensOutput,
} from "../src/operations/listOauthTokens";
import { withMainLayer } from "./setup";

withMainLayer("listOauthTokens", (it) => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListOauthTokensInput.fields.organization).toBeDefined();
    expect(ListOauthTokensInput.fields.application_id).toBeDefined();
    // Optional fields
    expect(ListOauthTokensInput.fields.page).toBeDefined();
    expect(ListOauthTokensInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListOauthTokensOutput.fields.current_page).toBeDefined();
    expect(ListOauthTokensOutput.fields.next_page).toBeDefined();
    expect(ListOauthTokensOutput.fields.next_page_url).toBeDefined();
    expect(ListOauthTokensOutput.fields.prev_page).toBeDefined();
    expect(ListOauthTokensOutput.fields.prev_page_url).toBeDefined();
    expect(ListOauthTokensOutput.fields.data).toBeDefined();
  });

  it.effect(
    "should return ListOauthTokensForbidden for non-existent application in valid organization",
    () =>
      Effect.gen(function* () {
        const { organization } = yield* Credentials;

        const result = yield* listOauthTokens({
          organization,
          application_id: "this-application-definitely-does-not-exist-12345",
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

        // API returns forbidden when accessing an application that doesn't exist in your organization
        expect(result).toBeInstanceOf(ListOauthTokensForbidden);
        if (result instanceof ListOauthTokensForbidden) {
          expect(result._tag).toBe("ListOauthTokensForbidden");
          expect(result.organization).toBe(organization);
          expect(result.application_id).toBe("this-application-definitely-does-not-exist-12345");
        }
      }),
  );

  it.effect("should return ListOauthTokensNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listOauthTokens({
        organization: "this-org-definitely-does-not-exist-12345",
        application_id: "some-application-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListOauthTokensNotfound);
      if (result instanceof ListOauthTokensNotfound) {
        expect(result._tag).toBe("ListOauthTokensNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
        expect(result.application_id).toBe("some-application-id");
      }
    }),
  );
});
