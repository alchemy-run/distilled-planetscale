import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  listInvoices,
  ListInvoicesInput,
  ListInvoicesNotfound,
  ListInvoicesOutput,
} from "../src/operations/listInvoices";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("listInvoices", () => {
  it("should have the correct input schema", () => {
    expect(ListInvoicesInput.fields.organization).toBeDefined();
    expect(ListInvoicesInput.fields.page).toBeDefined();
    expect(ListInvoicesInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListInvoicesOutput.fields.current_page).toBeDefined();
    expect(ListInvoicesOutput.fields.next_page).toBeDefined();
    expect(ListInvoicesOutput.fields.next_page_url).toBeDefined();
    expect(ListInvoicesOutput.fields.prev_page).toBeDefined();
    expect(ListInvoicesOutput.fields.prev_page_url).toBeDefined();
    expect(ListInvoicesOutput.fields.data).toBeDefined();
  });

  it.effect("should list invoices successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listInvoices({ organization });

      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListInvoicesNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listInvoices({
        organization: "this-org-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListInvoicesNotfound);
      if (result instanceof ListInvoicesNotfound) {
        expect(result._tag).toBe("ListInvoicesNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
