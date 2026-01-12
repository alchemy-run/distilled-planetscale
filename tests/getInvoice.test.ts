import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  getInvoice,
  GetInvoiceInput,
  GetInvoiceNotfound,
  GetInvoiceOutput,
} from "../src/operations/getInvoice";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("getInvoice", () => {
  it("should have the correct input schema", () => {
    expect(GetInvoiceInput.fields.organization).toBeDefined();
    expect(GetInvoiceInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetInvoiceOutput.fields.id).toBeDefined();
    expect(GetInvoiceOutput.fields.total).toBeDefined();
    expect(GetInvoiceOutput.fields.billing_period_start).toBeDefined();
    expect(GetInvoiceOutput.fields.billing_period_end).toBeDefined();
  });

  it.effect("should return GetInvoiceNotfound for non-existent invoice", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* getInvoice({
        organization,
        id: "this-invoice-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetInvoiceNotfound);
      if (result instanceof GetInvoiceNotfound) {
        expect(result._tag).toBe("GetInvoiceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.id).toBe("this-invoice-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return GetInvoiceNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getInvoice({
        organization: "this-org-definitely-does-not-exist-12345",
        id: "some-invoice-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetInvoiceNotfound);
      if (result instanceof GetInvoiceNotfound) {
        expect(result._tag).toBe("GetInvoiceNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
