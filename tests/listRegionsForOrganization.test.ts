import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listRegionsForOrganization,
  ListRegionsForOrganizationNotfound,
  ListRegionsForOrganizationInput,
  ListRegionsForOrganizationOutput,
} from "../src/operations/listRegionsForOrganization";
import { withMainLayer } from "./setup";

withMainLayer("listRegionsForOrganization", (it) => {
  it("should have the correct input schema", () => {
    expect(ListRegionsForOrganizationInput.fields.organization).toBeDefined();
    expect(ListRegionsForOrganizationInput.fields.page).toBeDefined();
    expect(ListRegionsForOrganizationInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListRegionsForOrganizationOutput.fields.data).toBeDefined();
    expect(ListRegionsForOrganizationOutput.fields.current_page).toBeDefined();
    expect(ListRegionsForOrganizationOutput.fields.next_page).toBeDefined();
    expect(ListRegionsForOrganizationOutput.fields.prev_page).toBeDefined();
    expect(ListRegionsForOrganizationOutput.fields.next_page_url).toBeDefined();
    expect(ListRegionsForOrganizationOutput.fields.prev_page_url).toBeDefined();
  });

  it.effect("should list regions for organization successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listRegionsForOrganization({
        organization,
      });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(Array.isArray(result.data)).toBe(true);

      // If there are regions, verify their structure
      if (result.data.length > 0) {
        const region = result.data[0];
        expect(region).toHaveProperty("id");
        expect(region).toHaveProperty("provider");
        expect(region).toHaveProperty("enabled");
        expect(region).toHaveProperty("public_ip_addresses");
        expect(region).toHaveProperty("display_name");
        expect(region).toHaveProperty("location");
        expect(region).toHaveProperty("slug");
        expect(region).toHaveProperty("current_default");
      }
    }),
  );

  it.effect("should support pagination parameters", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listRegionsForOrganization({
        organization,
        page: 1,
        per_page: 5,
      });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
    }),
  );

  it.effect("should return ListRegionsForOrganizationNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listRegionsForOrganization({
        organization: "this-org-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListRegionsForOrganizationNotfound);
      if (result instanceof ListRegionsForOrganizationNotfound) {
        expect(result._tag).toBe("ListRegionsForOrganizationNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );
});
