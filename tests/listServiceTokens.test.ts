import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  listServiceTokens,
  ListServiceTokensForbidden,
  ListServiceTokensNotfound,
  ListServiceTokensInput,
  ListServiceTokensOutput,
} from "../src/operations/listServiceTokens";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("listServiceTokens", () => {
  it("should have the correct input schema", () => {
    expect(ListServiceTokensInput.fields.organization).toBeDefined();
    expect(ListServiceTokensInput.fields.page).toBeDefined();
    expect(ListServiceTokensInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListServiceTokensOutput.fields.current_page).toBeDefined();
    expect(ListServiceTokensOutput.fields.next_page).toBeDefined();
    expect(ListServiceTokensOutput.fields.next_page_url).toBeDefined();
    expect(ListServiceTokensOutput.fields.prev_page).toBeDefined();
    expect(ListServiceTokensOutput.fields.prev_page_url).toBeDefined();
    expect(ListServiceTokensOutput.fields.data).toBeDefined();
  });

  it.effect("should list service tokens or return forbidden", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listServiceTokens({ organization }).pipe(
        Effect.map((data) => ({ success: true as const, data })),
        Effect.catchTag("ListServiceTokensForbidden", (error) =>
          Effect.succeed({ success: false as const, error }),
        ),
      );

      if (result.success) {
        expect(result.data).toHaveProperty("current_page");
        expect(result.data).toHaveProperty("data");
        expect(Array.isArray(result.data.data)).toBe(true);
      } else {
        // Service token may not have permission to list service tokens
        expect(result.error).toBeInstanceOf(ListServiceTokensForbidden);
        expect(result.error._tag).toBe("ListServiceTokensForbidden");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListServiceTokensNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listServiceTokens({
        organization: "this-org-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListServiceTokensNotfound);
      if (result instanceof ListServiceTokensNotfound) {
        expect(result._tag).toBe("ListServiceTokensNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
