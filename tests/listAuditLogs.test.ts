import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  listAuditLogs,
  ListAuditLogsInput,
  ListAuditLogsNotfound,
  ListAuditLogsOutput,
} from "../src/operations/listAuditLogs";
import { withMainLayer } from "./setup";

withMainLayer("listAuditLogs", (it) => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListAuditLogsInput.fields.organization).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListAuditLogsOutput.fields.has_next).toBeDefined();
    expect(ListAuditLogsOutput.fields.has_prev).toBeDefined();
    expect(ListAuditLogsOutput.fields.cursor_start).toBeDefined();
    expect(ListAuditLogsOutput.fields.cursor_end).toBeDefined();
    expect(ListAuditLogsOutput.fields.data).toBeDefined();
  });

  it.effect("should list audit logs successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* listAuditLogs({ organization });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("has_next");
      expect(result).toHaveProperty("has_prev");
      expect(result).toHaveProperty("cursor_start");
      expect(result).toHaveProperty("cursor_end");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect("should return ListAuditLogsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listAuditLogs({
        organization: "this-org-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListAuditLogsNotfound);
      if (result instanceof ListAuditLogsNotfound) {
        expect(result._tag).toBe("ListAuditLogsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );
});
