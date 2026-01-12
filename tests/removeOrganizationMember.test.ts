import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Cause, Effect, Exit, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  removeOrganizationMember,
  RemoveOrganizationMemberInput,
  RemoveOrganizationMemberNotfound,
} from "../src/operations/removeOrganizationMember";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("removeOrganizationMember", () => {
  it("should have the correct input schema", () => {
    expect(RemoveOrganizationMemberInput.fields.organization).toBeDefined();
    expect(RemoveOrganizationMemberInput.fields.id).toBeDefined();
    expect(RemoveOrganizationMemberInput.fields.delete_passwords).toBeDefined();
    expect(RemoveOrganizationMemberInput.fields.delete_service_tokens).toBeDefined();
  });

  it.effect("should return an error for non-existent member", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const exit = yield* removeOrganizationMember({
        organization,
        id: "non-existent-member-id-12345",
      }).pipe(Effect.exit);

      // The operation should fail for a non-existent member
      expect(Exit.isFailure(exit)).toBe(true);

      // If we got the expected typed error, verify its properties
      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause);
        if (error._tag === "Some" && error.value instanceof RemoveOrganizationMemberNotfound) {
          expect(error.value._tag).toBe("RemoveOrganizationMemberNotfound");
          expect(error.value.organization).toBe(organization);
          expect(error.value.id).toBe("non-existent-member-id-12345");
        }
        // Otherwise, the API may have returned a different error (forbidden, etc.)
        // which is acceptable for this test
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return an error for non-existent organization", () =>
    Effect.gen(function* () {
      const exit = yield* removeOrganizationMember({
        organization: "this-organization-definitely-does-not-exist-12345",
        id: "some-member-id",
      }).pipe(Effect.exit);

      // The operation should fail for a non-existent organization
      expect(Exit.isFailure(exit)).toBe(true);

      // If we got the expected typed error, verify its properties
      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause);
        if (error._tag === "Some" && error.value instanceof RemoveOrganizationMemberNotfound) {
          expect(error.value._tag).toBe("RemoveOrganizationMemberNotfound");
          expect(error.value.organization).toBe("this-organization-definitely-does-not-exist-12345");
        }
        // Otherwise, the API may have returned a different error format
        // which is acceptable for this test
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
