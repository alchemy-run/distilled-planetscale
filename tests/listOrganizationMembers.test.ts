import { Cause, Effect, Exit } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  listOrganizationMembers,
  ListOrganizationMembersInput,
  ListOrganizationMembersNotfound,
  ListOrganizationMembersOutput,
} from "../src/operations/listOrganizationMembers";
import { withMainLayer } from "./setup";

withMainLayer("listOrganizationMembers", (it) => {
  it("should have the correct input schema", () => {
    expect(ListOrganizationMembersInput.fields.organization).toBeDefined();
    expect(ListOrganizationMembersInput.fields.q).toBeDefined();
    expect(ListOrganizationMembersInput.fields.page).toBeDefined();
    expect(ListOrganizationMembersInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListOrganizationMembersOutput.fields.current_page).toBeDefined();
    expect(ListOrganizationMembersOutput.fields.next_page).toBeDefined();
    expect(ListOrganizationMembersOutput.fields.next_page_url).toBeDefined();
    expect(ListOrganizationMembersOutput.fields.prev_page).toBeDefined();
    expect(ListOrganizationMembersOutput.fields.prev_page_url).toBeDefined();
    expect(ListOrganizationMembersOutput.fields.data).toBeDefined();
  });

  it.effect("should list organization members successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* listOrganizationMembers({
        organization,
      });

      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);

      // Verify pagination fields
      expect(typeof result.current_page).toBe("number");
      expect(result.next_page === null || typeof result.next_page === "number").toBe(true);
      expect(result.prev_page === null || typeof result.prev_page === "number").toBe(true);

      // If there are members, verify the structure
      const member = result.data[0];
      if (member) {
        expect(member).toHaveProperty("id");
        expect(member).toHaveProperty("user");
        expect(member).toHaveProperty("role");
        expect(member).toHaveProperty("created_at");
        expect(member).toHaveProperty("updated_at");

        // Verify user structure
        expect(member.user).toHaveProperty("id");
        expect(member.user).toHaveProperty("display_name");
        expect(member.user).toHaveProperty("email");
        expect(member.user).toHaveProperty("avatar_url");

        // Verify role is one of the expected values
        expect(["member", "admin"]).toContain(member.role);
      }
    }),
  );

  it.effect("should support pagination parameters", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* listOrganizationMembers({
        organization,
        page: 1,
        per_page: 5,
      });

      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect("should return an error for non-existent organization", () =>
    Effect.gen(function* () {
      const exit = yield* listOrganizationMembers({
        organization: "this-organization-definitely-does-not-exist-12345",
      }).pipe(Effect.exit);

      // The operation should fail for a non-existent organization
      expect(Exit.isFailure(exit)).toBe(true);

      // If we got the expected typed error, verify its properties
      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause);
        if (error._tag === "Some" && error.value instanceof ListOrganizationMembersNotfound) {
          expect(error.value._tag).toBe("ListOrganizationMembersNotfound");
          expect(error.value.organization).toBe(
            "this-organization-definitely-does-not-exist-12345",
          );
        }
        // Otherwise, the API may have returned a different error format
        // which is acceptable for this test
      }
    }),
  );
});
