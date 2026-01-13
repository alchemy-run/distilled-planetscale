import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  getInvoiceLineItems,
  GetInvoiceLineItemsInput,
  GetInvoiceLineItemsNotfound,
  GetInvoiceLineItemsOutput,
} from "../src/operations/getInvoiceLineItems";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("getInvoiceLineItems", () => {
  it("should have the correct input schema", () => {
    expect(GetInvoiceLineItemsInput.fields.organization).toBeDefined();
    expect(GetInvoiceLineItemsInput.fields.id).toBeDefined();
    expect(GetInvoiceLineItemsInput.fields.page).toBeDefined();
    expect(GetInvoiceLineItemsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetInvoiceLineItemsOutput.fields.current_page).toBeDefined();
    expect(GetInvoiceLineItemsOutput.fields.next_page).toBeDefined();
    expect(GetInvoiceLineItemsOutput.fields.prev_page).toBeDefined();
    expect(GetInvoiceLineItemsOutput.fields.data).toBeDefined();
  });

  it.effect("should return GetInvoiceLineItemsNotfound for non-existent invoice", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* getInvoiceLineItems({
        organization,
        id: "this-invoice-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetInvoiceLineItemsNotfound);
      if (result instanceof GetInvoiceLineItemsNotfound) {
        expect(result._tag).toBe("GetInvoiceLineItemsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.id).toBe("this-invoice-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return GetInvoiceLineItemsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getInvoiceLineItems({
        organization: "this-org-definitely-does-not-exist-12345",
        id: "some-invoice-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetInvoiceLineItemsNotfound);
      if (result instanceof GetInvoiceLineItemsNotfound) {
        expect(result._tag).toBe("GetInvoiceLineItemsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
