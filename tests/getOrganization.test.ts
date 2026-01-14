import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import { Forbidden, NotFound } from "../src/errors";
import {
  getOrganization,
  GetOrganizationInput,
  GetOrganizationOutput,
} from "../src/operations/getOrganization";
import { withMainLayer } from "./setup";

withMainLayer("getOrganization", (it) => {
  // Schema validation
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

  // Success test
  it.effect("should fetch organization successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getOrganization({ organization });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", organization);
      expect(result).toHaveProperty("billing_email");
      expect(result).toHaveProperty("created_at");
      expect(result).toHaveProperty("updated_at");
      expect(result).toHaveProperty("plan");
      expect(typeof result.valid_billing_info).toBe("boolean");
      expect(typeof result.database_count).toBe("number");
    }),
  );

  // Error handling tests
  it.effect("should return NotFound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getOrganization({
        organization: "this-org-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      // API may return NotFound or Forbidden for non-existent resources
      const isExpectedError = result instanceof NotFound || result instanceof Forbidden;
      expect(isExpectedError).toBe(true);
      if (result instanceof NotFound) {
        expect(result._tag).toBe("NotFound");
        expect(result.message).toBeDefined();
      }
      if (result instanceof Forbidden) {
        expect(result._tag).toBe("Forbidden");
        expect(result.message).toBeDefined();
      }
    }),
  );
});
