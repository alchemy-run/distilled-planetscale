import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listClusterSizeSkus,
  ListClusterSizeSkusInput,
  ListClusterSizeSkusNotfound,
  ListClusterSizeSkusOutput,
} from "../src/operations/listClusterSizeSkus";
import { withMainLayer } from "./setup";

withMainLayer("listClusterSizeSkus", (it) => {
  it("should have the correct input schema", () => {
    expect(ListClusterSizeSkusInput.fields.organization).toBeDefined();
    expect(ListClusterSizeSkusInput.fields.engine).toBeDefined();
    expect(ListClusterSizeSkusInput.fields.rates).toBeDefined();
    expect(ListClusterSizeSkusInput.fields.region).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListClusterSizeSkusOutput.ast._tag).toBe("TupleType");
  });

  it.effect("should list cluster size SKUs successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listClusterSizeSkus({ organization });

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        const sku = result[0];
        expect(sku).toHaveProperty("name");
        expect(sku).toHaveProperty("display_name");
        expect(sku).toHaveProperty("cpu");
        expect(sku).toHaveProperty("ram");
        expect(sku).toHaveProperty("metal");
        expect(sku).toHaveProperty("enabled");
        expect(sku).toHaveProperty("sort_order");
        expect(sku).toHaveProperty("development");
        expect(sku).toHaveProperty("production");
      }
    }),
  );

  it.effect("should support engine filter parameter", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listClusterSizeSkus({
        organization,
        engine: "mysql",
      });

      expect(Array.isArray(result)).toBe(true);
    }),
  );

  it.effect("should support rates parameter", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listClusterSizeSkus({
        organization,
        rates: true,
      });

      expect(Array.isArray(result)).toBe(true);
    }),
  );

  it.effect("should return ListClusterSizeSkusNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listClusterSizeSkus({
        organization: "this-org-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListClusterSizeSkusNotfound);
      if (result instanceof ListClusterSizeSkusNotfound) {
        expect(result._tag).toBe("ListClusterSizeSkusNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );
});
