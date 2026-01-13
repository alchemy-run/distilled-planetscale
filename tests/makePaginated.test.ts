import { Effect, Stream } from "effect";
import { describe, expect, it } from "vitest";
import { Schema } from "effect";
import { API, ApiMethod, ApiPath, ApiPathParams } from "../src/client";
import { PlanetScaleCredentials } from "../src/credentials";
import { withMainLayer } from "./setup";

// Create a test paginated operation using the same pattern as listDatabases
const TestListDatabasesInput = Schema.Struct({
  organization: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}/databases`,
  [ApiPathParams]: ["organization"] as const,
});

const TestDatabaseItem = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
});

const TestListDatabasesOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.NullOr(Schema.Number),
  next_page_url: Schema.NullOr(Schema.String),
  prev_page: Schema.NullOr(Schema.Number),
  prev_page_url: Schema.NullOr(Schema.String),
  data: Schema.Array(TestDatabaseItem),
});

// Create a paginated operation
const testListDatabases = /*@__PURE__*/ API.makePaginated(() => ({
  inputSchema: TestListDatabasesInput,
  outputSchema: TestListDatabasesOutput,
  errors: [],
}));

describe("API.makePaginated", () => {
  it("should create an operation with pages method", () => {
    expect(typeof testListDatabases.pages).toBe("function");
  });

  it("should create an operation with items method", () => {
    expect(typeof testListDatabases.items).toBe("function");
  });

  it("should be callable as a regular operation", () => {
    expect(typeof testListDatabases).toBe("function");
  });
});

withMainLayer("API.makePaginated integration", (it) => {
  it.effect("should fetch a single page using base operation", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* testListDatabases({ organization });

      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect("should stream pages using .pages() method", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const pages = yield* testListDatabases.pages({ organization }).pipe(
        Stream.take(2),
        Stream.runCollect,
      );

      expect(pages.length).toBeGreaterThan(0);

      for (const page of pages) {
        expect(page).toHaveProperty("current_page");
        expect(page).toHaveProperty("data");
      }
    }),
  );

  it.effect("should stream items using .items() method", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const items = yield* testListDatabases.items({ organization }).pipe(
        Stream.take(5),
        Stream.runCollect,
      );

      for (const item of items) {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("name");
      }
    }),
  );
});
