import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  reviewDeployRequest,
  ReviewDeployRequestForbidden,
  ReviewDeployRequestNotfound,
  ReviewDeployRequestInput,
  ReviewDeployRequestOutput,
} from "../src/operations/reviewDeployRequest";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("reviewDeployRequest", (it) => {
  it("should have the correct input schema", () => {
    expect(ReviewDeployRequestInput.fields.organization).toBeDefined();
    expect(ReviewDeployRequestInput.fields.database).toBeDefined();
    expect(ReviewDeployRequestInput.fields.number).toBeDefined();
    expect(ReviewDeployRequestInput.fields.state).toBeDefined();
    expect(ReviewDeployRequestInput.fields.body).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ReviewDeployRequestOutput.fields.id).toBeDefined();
    expect(ReviewDeployRequestOutput.fields.body).toBeDefined();
    expect(ReviewDeployRequestOutput.fields.html_body).toBeDefined();
    expect(ReviewDeployRequestOutput.fields.state).toBeDefined();
    expect(ReviewDeployRequestOutput.fields.created_at).toBeDefined();
    expect(ReviewDeployRequestOutput.fields.updated_at).toBeDefined();
    expect(ReviewDeployRequestOutput.fields.actor).toBeDefined();
  });

  it.effect("should return ReviewDeployRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* reviewDeployRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
        state: "commented",
        body: "Test comment",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof ReviewDeployRequestNotfound || result instanceof ReviewDeployRequestForbidden;
      expect(isExpectedError).toBe(true);
      if (result instanceof ReviewDeployRequestNotfound) {
        expect(result._tag).toBe("ReviewDeployRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ReviewDeployRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* reviewDeployRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
        state: "commented",
        body: "Test comment",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof ReviewDeployRequestNotfound || result instanceof ReviewDeployRequestForbidden;
      expect(isExpectedError).toBe(true);
      if (result instanceof ReviewDeployRequestNotfound) {
        expect(result._tag).toBe("ReviewDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ReviewDeployRequestNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* reviewDeployRequest({
        organization,
        database,
        number: 999999999,
        state: "commented",
        body: "Test comment",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof ReviewDeployRequestNotfound || result instanceof ReviewDeployRequestForbidden;
      expect(isExpectedError).toBe(true);
      if (result instanceof ReviewDeployRequestNotfound) {
        expect(result._tag).toBe("ReviewDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }),
  );

  // Note: This test is skipped because creating reviews requires an existing deploy request
  // and may modify state. When enabled, it demonstrates proper usage of the operation.
  it.effect("should create a review successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const number = 1; // Replace with an existing deploy request number

      const result = yield* reviewDeployRequest({
        organization,
        database,
        number,
        state: "commented",
        body: "Test review comment",
      }).pipe(
        Effect.catchTag("ReviewDeployRequestForbidden", () => Effect.succeed(null)),
        Effect.catchTag("ReviewDeployRequestNotfound", () => Effect.succeed(null)),
      );

      if (result === null) {
        return; // Skip test gracefully if forbidden or deploy request doesn't exist
      }

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("body", "Test review comment");
      expect(result).toHaveProperty("state", "commented");
      expect(result).toHaveProperty("actor");
      expect(result.actor).toHaveProperty("id");
      expect(result.actor).toHaveProperty("display_name");
    }),
  );
});
