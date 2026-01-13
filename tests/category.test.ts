import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Category from "../src/category";
import { ConfigError, PlanetScaleError } from "../src/errors";
import { PlanetScaleApiError, PlanetScaleParseError } from "../src/client";
import {
  GetOrganizationNotfound,
  GetOrganizationUnauthorized,
  GetOrganizationForbidden,
} from "../src/operations/getOrganization";
import {
  DeleteDatabaseNotfound,
} from "../src/operations/deleteDatabase";

// Test error classes with different categories
class TestAuthError extends S.TaggedError<TestAuthError>()(
  "TestAuthError",
  { message: S.String },
).pipe(Category.withAuthError) {}

class TestNotFoundError extends S.TaggedError<TestNotFoundError>()(
  "TestNotFoundError",
  { resource: S.String },
).pipe(Category.withNotFoundError) {}

class TestConflictError extends S.TaggedError<TestConflictError>()(
  "TestConflictError",
  {},
).pipe(Category.withConflictError) {}

class TestThrottlingError extends S.TaggedError<TestThrottlingError>()(
  "TestThrottlingError",
  { retryAfterSeconds: S.optional(S.Number) },
).pipe(Category.withThrottlingError) {}

class TestNetworkError extends S.TaggedError<TestNetworkError>()(
  "TestNetworkError",
  {},
).pipe(Category.withNetworkError) {}

class TestServerError extends S.TaggedError<TestServerError>()(
  "TestServerError",
  {},
).pipe(Category.withServerError) {}

class TestMultiCategoryError extends S.TaggedError<TestMultiCategoryError>()(
  "TestMultiCategoryError",
  {},
).pipe(Category.withCategory(Category.ServerError, Category.ThrottlingError)) {}

class UncategorizedError extends S.TaggedError<UncategorizedError>()(
  "UncategorizedError",
  {},
) {}

describe("Category", () => {
  describe("hasCategory", () => {
    it("returns true when error has the category", () => {
      const error = new TestAuthError({ message: "test" });
      expect(Category.hasCategory(error, Category.AuthError)).toBe(true);
    });

    it("returns false when error does not have the category", () => {
      const error = new TestAuthError({ message: "test" });
      expect(Category.hasCategory(error, Category.NotFoundError)).toBe(false);
    });

    it("returns false for uncategorized errors", () => {
      const error = new UncategorizedError();
      expect(Category.hasCategory(error, Category.AuthError)).toBe(false);
    });

    it("returns false for non-error values", () => {
      expect(Category.hasCategory(null, Category.AuthError)).toBe(false);
      expect(Category.hasCategory(undefined, Category.AuthError)).toBe(false);
      expect(Category.hasCategory("string", Category.AuthError)).toBe(false);
    });

    it("handles errors with multiple categories", () => {
      const error = new TestMultiCategoryError();
      expect(Category.hasCategory(error, Category.ServerError)).toBe(true);
      expect(Category.hasCategory(error, Category.ThrottlingError)).toBe(true);
      expect(Category.hasCategory(error, Category.AuthError)).toBe(false);
    });
  });

  describe("is* predicates", () => {
    it("isAuthError", () => {
      expect(Category.isAuthError(new TestAuthError({ message: "test" }))).toBe(true);
      expect(Category.isAuthError(new TestNotFoundError({ resource: "db" }))).toBe(false);
    });

    it("isNotFoundError", () => {
      expect(Category.isNotFoundError(new TestNotFoundError({ resource: "db" }))).toBe(true);
      expect(Category.isNotFoundError(new TestAuthError({ message: "test" }))).toBe(false);
    });

    it("isConflictError", () => {
      expect(Category.isConflictError(new TestConflictError())).toBe(true);
      expect(Category.isConflictError(new TestAuthError({ message: "test" }))).toBe(false);
    });

    it("isThrottlingError", () => {
      expect(Category.isThrottlingError(new TestThrottlingError({}))).toBe(true);
      expect(Category.isThrottlingError(new TestAuthError({ message: "test" }))).toBe(false);
    });

    it("isNetworkError", () => {
      expect(Category.isNetworkError(new TestNetworkError())).toBe(true);
      expect(Category.isNetworkError(new TestAuthError({ message: "test" }))).toBe(false);
    });

    it("isServerError", () => {
      expect(Category.isServerError(new TestServerError())).toBe(true);
      expect(Category.isServerError(new TestAuthError({ message: "test" }))).toBe(false);
    });

    it("isConfigurationError", () => {
      expect(Category.isConfigurationError(new ConfigError({ message: "missing env" }))).toBe(true);
      expect(Category.isConfigurationError(new TestAuthError({ message: "test" }))).toBe(false);
    });

    it("isParseError", () => {
      expect(Category.isParseError(new PlanetScaleParseError({ body: {}, cause: null }))).toBe(true);
      expect(Category.isParseError(new TestAuthError({ message: "test" }))).toBe(false);
    });
  });

  describe("built-in error categories", () => {
    it("PlanetScaleApiError has ServerError category", () => {
      const error = new PlanetScaleApiError({ body: { code: "unknown" } });
      expect(Category.isServerError(error)).toBe(true);
    });

    it("PlanetScaleParseError has ParseError category", () => {
      const error = new PlanetScaleParseError({ body: {}, cause: null });
      expect(Category.isParseError(error)).toBe(true);
    });

    it("ConfigError has ConfigurationError category", () => {
      const error = new ConfigError({ message: "missing env var" });
      expect(Category.isConfigurationError(error)).toBe(true);
    });

    it("PlanetScaleError has ServerError category", () => {
      const error = new PlanetScaleError({ message: "something went wrong" });
      expect(Category.isServerError(error)).toBe(true);
    });
  });

  describe("operation error categories (auto-applied from ApiErrorCode)", () => {
    it("not_found errors have NotFoundError category", () => {
      const error = new GetOrganizationNotfound({ organization: "test", message: "not found" });
      expect(Category.isNotFoundError(error)).toBe(true);
      expect(Category.isAuthError(error)).toBe(false);
    });

    it("unauthorized errors have AuthError category", () => {
      const error = new GetOrganizationUnauthorized({ organization: "test", message: "unauthorized" });
      expect(Category.isAuthError(error)).toBe(true);
      expect(Category.isNotFoundError(error)).toBe(false);
    });

    it("forbidden errors have AuthError category", () => {
      const error = new GetOrganizationForbidden({ organization: "test", message: "forbidden" });
      expect(Category.isAuthError(error)).toBe(true);
      expect(Category.isNotFoundError(error)).toBe(false);
    });

    it("not_found errors from different operations share the same category", () => {
      const orgError = new GetOrganizationNotfound({ organization: "test", message: "not found" });
      const dbError = new DeleteDatabaseNotfound({ organization: "test", database: "db", message: "not found" });
      expect(Category.isNotFoundError(orgError)).toBe(true);
      expect(Category.isNotFoundError(dbError)).toBe(true);
    });

    it.effect("operation errors can be caught by category", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(
          new GetOrganizationNotfound({ organization: "test", message: "not found" }),
        ).pipe(Category.catchNotFoundError(() => Effect.succeed("caught")));
        expect(result).toBe("caught");
      }),
    );
  });

  describe("isTransientError", () => {
    it("returns true for throttling errors", () => {
      expect(Category.isTransientError(new TestThrottlingError({}))).toBe(true);
    });

    it("returns true for server errors", () => {
      expect(Category.isTransientError(new TestServerError())).toBe(true);
    });

    it("returns true for network errors", () => {
      expect(Category.isTransientError(new TestNetworkError())).toBe(true);
    });

    it("returns true for PlanetScaleApiError (has ServerError category)", () => {
      expect(Category.isTransientError(new PlanetScaleApiError({ body: {} }))).toBe(true);
    });

    it("returns false for auth errors", () => {
      expect(Category.isTransientError(new TestAuthError({ message: "test" }))).toBe(false);
    });

    it("returns false for not found errors", () => {
      expect(Category.isTransientError(new TestNotFoundError({ resource: "db" }))).toBe(false);
    });

    it("returns false for configuration errors", () => {
      expect(Category.isTransientError(new ConfigError({ message: "missing" }))).toBe(false);
    });
  });

  describe("catch* catchers", () => {
    it.effect("catchAuthError catches auth errors", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(
          new TestAuthError({ message: "unauthorized" }),
        ).pipe(Category.catchAuthError(() => Effect.succeed("caught")));
        expect(result).toBe("caught");
      }),
    );

    it.effect("catchAuthError does not catch other errors", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(new TestNotFoundError({ resource: "db" })).pipe(
          Category.catchAuthError(() => Effect.succeed("caught")),
          Effect.catchAll(() => Effect.succeed("not caught")),
        );
        expect(result).toBe("not caught");
      }),
    );

    it.effect("catchNotFoundError catches not found errors", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(new TestNotFoundError({ resource: "db" })).pipe(
          Category.catchNotFoundError(() => Effect.succeed("caught")),
        );
        expect(result).toBe("caught");
      }),
    );

    it.effect("catchServerError catches server errors", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(new TestServerError()).pipe(
          Category.catchServerError(() => Effect.succeed("caught")),
        );
        expect(result).toBe("caught");
      }),
    );

    it.effect("catchThrottlingError catches throttling errors", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(new TestThrottlingError({})).pipe(
          Category.catchThrottlingError(() => Effect.succeed("caught")),
        );
        expect(result).toBe("caught");
      }),
    );

    it.effect("catchConflictError catches conflict errors", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(new TestConflictError()).pipe(
          Category.catchConflictError(() => Effect.succeed("caught")),
        );
        expect(result).toBe("caught");
      }),
    );

    it.effect("catchNetworkError catches network errors", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(new TestNetworkError()).pipe(
          Category.catchNetworkError(() => Effect.succeed("caught")),
        );
        expect(result).toBe("caught");
      }),
    );

    it.effect("catchConfigurationError catches configuration errors", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(new ConfigError({ message: "missing" })).pipe(
          Category.catchConfigurationError(() => Effect.succeed("caught")),
        );
        expect(result).toBe("caught");
      }),
    );

    it.effect("catchParseError catches parse errors", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(new PlanetScaleParseError({ body: {}, cause: null })).pipe(
          Category.catchParseError(() => Effect.succeed("caught")),
        );
        expect(result).toBe("caught");
      }),
    );

    it.effect("error handler receives the error", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(
          new TestAuthError({ message: "my message" }),
        ).pipe(
          Category.catchAuthError((err) => Effect.succeed(err.message)),
        );
        expect(result).toBe("my message");
      }),
    );
  });

  describe("catchErrors (multi-category catcher)", () => {
    it.effect("catches errors with single category", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(
          new TestAuthError({ message: "test" }),
        ).pipe(
          Category.catchErrors(Category.AuthError, () =>
            Effect.succeed("caught"),
          ),
        );
        expect(result).toBe("caught");
      }),
    );

    it.effect("catches errors matching any of multiple categories", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(new TestMultiCategoryError()).pipe(
          Category.catchErrors(
            Category.ServerError,
            Category.ThrottlingError,
            () => Effect.succeed("caught"),
          ),
        );
        expect(result).toBe("caught");
      }),
    );

    it.effect("catches auth error when listing multiple categories", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(new TestAuthError({ message: "test" })).pipe(
          Category.catchErrors(
            Category.NotFoundError,
            Category.AuthError,
            () => Effect.succeed("caught"),
          ),
        );
        expect(result).toBe("caught");
      }),
    );

    it.effect("does not catch errors not in category list", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(new TestAuthError({ message: "test" })).pipe(
          Category.catchErrors(
            Category.NotFoundError,
            Category.ServerError,
            () => Effect.succeed("caught"),
          ),
          Effect.catchAll(() => Effect.succeed("not caught")),
        );
        expect(result).toBe("not caught");
      }),
    );

    it.effect("catches errors using string literals", () =>
      Effect.gen(function* () {
        const result = yield* Effect.fail(
          new TestAuthError({ message: "test" }),
        ).pipe(
          Category.catchErrors("AuthError", () =>
            Effect.succeed("caught"),
          ),
        );
        expect(result).toBe("caught");
      }),
    );
  });

  describe("use with Effect.retry", () => {
    it.effect("can use predicates with Effect.retry", () =>
      Effect.gen(function* () {
        let attempts = 0;
        const result = yield* Effect.sync(() => {
          attempts++;
          if (attempts < 3) {
            throw new TestServerError();
          }
          return "success";
        }).pipe(
          Effect.catchAllDefect((e) =>
            e instanceof TestServerError ? Effect.fail(e) : Effect.die(e),
          ),
          Effect.retry({
            times: 3,
            while: Category.isServerError,
          }),
        );
        expect(result).toBe("success");
        expect(attempts).toBe(3);
      }),
    );

    it.effect("can use isTransientError for retry logic", () =>
      Effect.gen(function* () {
        let attempts = 0;
        const result = yield* Effect.sync(() => {
          attempts++;
          if (attempts < 2) {
            throw new TestThrottlingError({});
          }
          return "success";
        }).pipe(
          Effect.catchAllDefect((e) =>
            e instanceof TestThrottlingError ? Effect.fail(e) : Effect.die(e),
          ),
          Effect.retry({
            times: 2,
            while: Category.isTransientError,
          }),
        );
        expect(result).toBe("success");
        expect(attempts).toBe(2);
      }),
    );
  });
});
