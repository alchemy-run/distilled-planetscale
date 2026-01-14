import { Effect } from "effect";
import { expect } from "vitest";
import {
  listPublicRegions,
  ListPublicRegionsInput,
  ListPublicRegionsOutput,
} from "../src/operations/listPublicRegions";
import { withMainLayer } from "./setup";

withMainLayer("listPublicRegions", (it) => {
  it("should have the correct input schema", () => {
    expect(ListPublicRegionsInput.fields.page).toBeDefined();
    expect(ListPublicRegionsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListPublicRegionsOutput.fields.data).toBeDefined();
    expect(ListPublicRegionsOutput.fields.current_page).toBeDefined();
    expect(ListPublicRegionsOutput.fields.next_page).toBeDefined();
    expect(ListPublicRegionsOutput.fields.prev_page).toBeDefined();
    expect(ListPublicRegionsOutput.fields.next_page_url).toBeDefined();
    expect(ListPublicRegionsOutput.fields.prev_page_url).toBeDefined();
  });

  it.effect("should list public regions successfully", () =>
    Effect.gen(function* () {
      const result = yield* listPublicRegions({});

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(Array.isArray(result.data)).toBe(true);

      // Public regions endpoint should return at least one region
      if (result.data.length > 0) {
        const region = result.data[0];
        expect(region).toHaveProperty("id");
        expect(region).toHaveProperty("provider");
        expect(region).toHaveProperty("enabled");
        expect(region).toHaveProperty("public_ip_addresses");
        expect(region).toHaveProperty("display_name");
        expect(region).toHaveProperty("location");
        expect(region).toHaveProperty("slug");
      }
    }),
  );

  it.effect("should support pagination parameters", () =>
    Effect.gen(function* () {
      const result = yield* listPublicRegions({
        page: 1,
        per_page: 5,
      });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );
});
