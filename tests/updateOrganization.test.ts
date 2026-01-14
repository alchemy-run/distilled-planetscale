import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  updateOrganization,
  UpdateOrganizationForbidden,
  UpdateOrganizationInput,
  UpdateOrganizationNotfound,
  UpdateOrganizationOutput,
} from "../src/operations/updateOrganization";
import { withMainLayer } from "./setup";

withMainLayer("updateOrganization", (it) => {
  it("should have the correct input schema", () => {
    expect(UpdateOrganizationInput.fields.organization).toBeDefined();
    expect(UpdateOrganizationInput.fields.billing_email).toBeDefined();
    expect(UpdateOrganizationInput.fields.idp_managed_roles).toBeDefined();
    expect(UpdateOrganizationInput.fields.invoice_budget_amount).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateOrganizationOutput.fields.id).toBeDefined();
    expect(UpdateOrganizationOutput.fields.name).toBeDefined();
    expect(UpdateOrganizationOutput.fields.billing_email).toBeDefined();
    expect(UpdateOrganizationOutput.fields.created_at).toBeDefined();
    expect(UpdateOrganizationOutput.fields.updated_at).toBeDefined();
    expect(UpdateOrganizationOutput.fields.plan).toBeDefined();
    expect(UpdateOrganizationOutput.fields.valid_billing_info).toBeDefined();
    expect(UpdateOrganizationOutput.fields.idp_managed_roles).toBeDefined();
    expect(UpdateOrganizationOutput.fields.invoice_budget_amount).toBeDefined();
  });

  it.effect("should update an organization successfully or return forbidden", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      // Update with idp_managed_roles set to false (a safe operation)
      // Note: Service tokens may not have permission to update organizations
      const result = yield* updateOrganization({
        organization,
        idp_managed_roles: false,
      }).pipe(
        Effect.catchTag("UpdateOrganizationForbidden", (e) =>
          Effect.succeed({ _forbidden: true as const, organization: e.organization }),
        ),
      );

      if ("_forbidden" in result) {
        // Service token doesn't have permission - verify error properties
        expect(result.organization).toBe(organization);
      } else {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("name");
        expect(result.name).toBe(organization);
        expect(result).toHaveProperty("billing_email");
        expect(result).toHaveProperty("plan");
        expect(result).toHaveProperty("idp_managed_roles");
      }
    }),
  );

  it.effect("should return UpdateOrganizationNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateOrganization({
        organization: "this-organization-definitely-does-not-exist-12345",
        idp_managed_roles: false,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateOrganizationNotfound);
      if (result instanceof UpdateOrganizationNotfound) {
        expect(result._tag).toBe("UpdateOrganizationNotfound");
        expect(result.organization).toBe("this-organization-definitely-does-not-exist-12345");
      }
    }),
  );
});
