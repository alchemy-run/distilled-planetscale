import { Effect } from "effect";
import { expect } from "vitest";
import {
  listOrganizations,
  ListOrganizationsInput,
  ListOrganizationsOutput,
} from "../src/operations/listOrganizations";
import { withMainLayer } from "./setup";

withMainLayer("listOrganizations", (it) => {
  it("should have the correct input schema", () => {
    expect(ListOrganizationsInput.fields.page).toBeDefined();
    expect(ListOrganizationsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListOrganizationsOutput.fields.current_page).toBeDefined();
    expect(ListOrganizationsOutput.fields.next_page).toBeDefined();
    expect(ListOrganizationsOutput.fields.next_page_url).toBeDefined();
    expect(ListOrganizationsOutput.fields.prev_page).toBeDefined();
    expect(ListOrganizationsOutput.fields.prev_page_url).toBeDefined();
    expect(ListOrganizationsOutput.fields.data).toBeDefined();
  });

  it.effect("should list organizations successfully", () =>
    Effect.gen(function* () {
      const result = yield* listOrganizations({});

      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);

      // Verify pagination fields
      expect(typeof result.current_page).toBe("number");
      expect(result.next_page === null || typeof result.next_page === "number").toBe(true);
      expect(result.prev_page === null || typeof result.prev_page === "number").toBe(true);

      // If there are organizations, verify the structure
      if (result.data.length > 0) {
        const org = result.data[0];
        expect(org).toHaveProperty("id");
        expect(org).toHaveProperty("name");
        expect(org).toHaveProperty("billing_email");
        expect(org).toHaveProperty("created_at");
        expect(org).toHaveProperty("updated_at");
        expect(org).toHaveProperty("plan");
        expect(org).toHaveProperty("database_count");
      }
    }),
  );

  it.effect("should support pagination parameters", () =>
    Effect.gen(function* () {
      const result = yield* listOrganizations({
        page: 1,
        per_page: 5,
      });

      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );
});
