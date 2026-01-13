import { Effect, Stream } from "effect";
import { describe, expect, it } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import { listDatabases } from "../src/operations/listDatabases";
import { paginateItems, paginatePages, getPath, DefaultPaginationTrait } from "../src/pagination";
import { withMainLayer } from "./setup";

describe("pagination utilities", () => {
  describe("getPath", () => {
    it("should get top-level properties", () => {
      const obj = { name: "test", value: 42 };
      expect(getPath(obj, "name")).toBe("test");
      expect(getPath(obj, "value")).toBe(42);
    });

    it("should get nested properties", () => {
      const obj = { user: { profile: { name: "John" } } };
      expect(getPath(obj, "user.profile.name")).toBe("John");
    });

    it("should return undefined for missing properties", () => {
      const obj = { name: "test" };
      expect(getPath(obj, "missing")).toBeUndefined();
      expect(getPath(obj, "deeply.nested.missing")).toBeUndefined();
    });

    it("should handle null/undefined gracefully", () => {
      expect(getPath(null, "name")).toBeUndefined();
      expect(getPath(undefined, "name")).toBeUndefined();
    });
  });

  describe("DefaultPaginationTrait", () => {
    it("should have correct default values", () => {
      expect(DefaultPaginationTrait.inputToken).toBe("page");
      expect(DefaultPaginationTrait.outputToken).toBe("next_page");
      expect(DefaultPaginationTrait.items).toBe("data");
      expect(DefaultPaginationTrait.pageSize).toBe("per_page");
    });
  });
});

withMainLayer("paginatePages", (it) => {
  it.effect("should stream pages from listDatabases", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // Collect all pages (with a reasonable limit for testing)
      const pages = yield* paginatePages(listDatabases, { organization }).pipe(
        Stream.take(3), // Limit to 3 pages max
        Stream.runCollect,
      );

      // Should have at least one page
      expect(pages.length).toBeGreaterThan(0);

      // Each page should have expected structure
      for (const page of pages) {
        expect(page).toHaveProperty("current_page");
        expect(page).toHaveProperty("next_page");
        expect(page).toHaveProperty("data");
        expect(Array.isArray(page.data)).toBe(true);
      }
    }),
  );
});

withMainLayer("paginateItems", (it) => {
  it.effect("should stream individual items from listDatabases", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // Collect all items (with a reasonable limit)
      const items = yield* paginateItems(listDatabases, { organization }).pipe(
        Stream.take(10), // Limit to 10 items max
        Stream.runCollect,
      );

      // Each item should be a database object
      for (const item of items) {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("name");
      }
    }),
  );
});
