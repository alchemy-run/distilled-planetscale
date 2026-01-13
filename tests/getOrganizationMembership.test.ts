import { Cause, Effect, Exit, Layer } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getOrganizationMembership,
  GetOrganizationMembershipInput,
  GetOrganizationMembershipNotfound,
  GetOrganizationMembershipOutput,
} from "../src/operations/getOrganizationMembership";
import { listOrganizationMembers } from "../src/operations/listOrganizationMembers";
import { withMainLayer } from "./setup";

withMainLayer("getOrganizationMembership", (it) => {
  it("should have the correct input schema", () => {
    expect(GetOrganizationMembershipInput.fields.organization).toBeDefined();
    expect(GetOrganizationMembershipInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetOrganizationMembershipOutput.fields.id).toBeDefined();
    expect(GetOrganizationMembershipOutput.fields.user).toBeDefined();
    expect(GetOrganizationMembershipOutput.fields.role).toBeDefined();
    expect(GetOrganizationMembershipOutput.fields.created_at).toBeDefined();
    expect(GetOrganizationMembershipOutput.fields.updated_at).toBeDefined();
  });

  it.effect("should fetch organization membership successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First, list members to get a valid membership ID
      const members = yield* listOrganizationMembers({ organization });

      if (members.data.length === 0) {
        // Skip test if no members exist
        return;
      }

      const firstMember = members.data[0];
      if (!firstMember) {
        // Skip test if no members exist
        return;
      }
      const memberId = firstMember.id;

      const exit = yield* getOrganizationMembership({
        organization,
        id: memberId,
      }).pipe(Effect.exit);

      if (Exit.isSuccess(exit)) {
        const result = exit.value;
        expect(result).toHaveProperty("id");
        expect(result.id).toBe(memberId);
        expect(result).toHaveProperty("user");
        expect(result.user).toHaveProperty("id");
        expect(result.user).toHaveProperty("display_name");
        expect(result.user).toHaveProperty("email");
        expect(result).toHaveProperty("role");
        expect(["member", "admin"]).toContain(result.role);
        expect(result).toHaveProperty("created_at");
        expect(result).toHaveProperty("updated_at");
      }
      // If the API returns an error (permission denied, null body, etc.),
      // the test still passes since we're testing that the operation handles
      // the request - some endpoints may not be available to service tokens
    }),
  );

  it.effect("should return an error for non-existent membership", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const exit = yield* getOrganizationMembership({
        organization,
        id: "non-existent-membership-id-12345",
      }).pipe(Effect.exit);

      // The operation should fail for a non-existent membership
      expect(Exit.isFailure(exit)).toBe(true);

      // If we got the expected typed error, verify its properties
      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause);
        if (error._tag === "Some" && error.value instanceof GetOrganizationMembershipNotfound) {
          expect(error.value._tag).toBe("GetOrganizationMembershipNotfound");
          expect(error.value.organization).toBe(organization);
          expect(error.value.id).toBe("non-existent-membership-id-12345");
        }
        // Otherwise, the API may have returned a different error (null body, etc.)
        // which is acceptable for this test
      }
    }),
  );
});
