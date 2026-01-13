import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getOrganization,
  GetOrganizationInput,
  GetOrganizationNotfound,
  GetOrganizationOutput,
} from "../src/operations/getOrganization";
import { withMainLayer } from "./setup";

withMainLayer("getOrganization", (it) => {
  it("should have the correct input schema", () => {
    expect(GetOrganizationInput.fields.organization).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetOrganizationOutput.fields.id).toBeDefined();
    expect(GetOrganizationOutput.fields.name).toBeDefined();
    expect(GetOrganizationOutput.fields.billing_email).toBeDefined();
    expect(GetOrganizationOutput.fields.created_at).toBeDefined();
    expect(GetOrganizationOutput.fields.updated_at).toBeDefined();
    expect(GetOrganizationOutput.fields.plan).toBeDefined();
    expect(GetOrganizationOutput.fields.valid_billing_info).toBeDefined();
    expect(GetOrganizationOutput.fields.database_count).toBeDefined();
  });

  it.effect("should fetch an organization successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* getOrganization({
        organization,
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result.name).toBe(organization);
      expect(result).toHaveProperty("billing_email");
      expect(result).toHaveProperty("plan");
      expect(result).toHaveProperty("database_count");
    }),
  );

  it.effect("should return GetOrganizationNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getOrganization({
        organization: "this-organization-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetOrganizationNotfound);
      if (result instanceof GetOrganizationNotfound) {
        expect(result._tag).toBe("GetOrganizationNotfound");
        expect(result.organization).toBe("this-organization-definitely-does-not-exist-12345");
      }
    }),
  );
});
