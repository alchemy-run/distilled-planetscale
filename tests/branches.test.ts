import { Effect, Schedule } from "effect";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createBranch } from "../src/operations/createBranch";
import { deleteBranch } from "../src/operations/deleteBranch";
import { getBranch } from "../src/operations/getBranch";
import { listBranches } from "../src/operations/listBranches";
import {
  getTestDatabase,
  runEffect,
  setupTestDatabase,
  teardownTestDatabase,
} from "./setup";

/**
 * Wait for a branch to reach the "ready" state.
 * Polls every 5 seconds for up to 10 minutes.
 */
const waitForBranchReady = (organization: string, database: string, branch: string) =>
  Effect.retry(
    getBranch({ organization, database, branch }).pipe(
      Effect.tap((b) =>
        Effect.sync(() => process.stderr.write(`[waitForBranchReady] branch="${branch}" ready=${b.ready}\n`)),
      ),
      Effect.flatMap((b) =>
        b.ready ? Effect.succeed(b) : Effect.fail({ _tag: "NotReady" as const, ready: b.ready }),
      ),
    ),
    {
      schedule: Schedule.intersect(Schedule.recurs(120), Schedule.spaced("5 seconds")),
      while: (e) => "_tag" in e && e._tag === "NotReady",
    },
  );

describe("branches", () => {
  beforeAll(async () => {
    await Effect.runPromise(setupTestDatabase());
  }, 300000); // 5 minute timeout for database creation

  afterAll(async () => {
    await Effect.runPromise(teardownTestDatabase());
  });

  it("can list branches", async () => {
    const db = getTestDatabase();
    const result = await runEffect(
      listBranches({
        organization: db.organization,
        database: db.name,
      }),
    );

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  it("can get a branch", async () => {
    const db = getTestDatabase();
    const result = await runEffect(
      getBranch({
        organization: db.organization,
        database: db.name,
        branch: "main",
      }),
    );

    expect(result.name).toBe("main");
  });

  // This test is slow (can take several minutes) - skip by default
  it.skip("can create and delete a branch", async () => {
    const db = getTestDatabase();
    const branchName = `test-${Date.now()}`;

    // Create branch
    const created = await runEffect(
      createBranch({
        organization: db.organization,
        database: db.name,
        name: branchName,
        parent_branch: "main",
      }),
    );
    expect(created.name).toBe(branchName);

    // Wait for ready
    await runEffect(waitForBranchReady(db.organization, db.name, branchName));

    // Delete branch
    await runEffect(
      deleteBranch({
        organization: db.organization,
        database: db.name,
        branch: branchName,
      }),
    );

    // Verify deleted
    const error = await runEffect(
      getBranch({
        organization: db.organization,
        database: db.name,
        branch: branchName,
      }).pipe(
        Effect.matchEffect({
          onFailure: (e) => Effect.succeed(e),
          onSuccess: () => Effect.succeed(null),
        }),
      ),
    );

    expect(error).not.toBeNull();
    expect((error as { _tag: string })._tag).toBe("NotFound");
  });

  it("get non-existent branch returns NotFound", async () => {
    const db = getTestDatabase();
    const error = await runEffect(
      getBranch({
        organization: db.organization,
        database: db.name,
        branch: "does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (e) => Effect.succeed(e),
          onSuccess: () => Effect.succeed(null),
        }),
      ),
    );

    expect(error).not.toBeNull();
    expect((error as { _tag: string })._tag).toBe("NotFound");
  });

  it("delete non-existent branch returns NotFound", async () => {
    const db = getTestDatabase();
    const error = await runEffect(
      deleteBranch({
        organization: db.organization,
        database: db.name,
        branch: "does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (e) => Effect.succeed(e),
          onSuccess: () => Effect.succeed(null),
        }),
      ),
    );

    expect(error).not.toBeNull();
    expect((error as { _tag: string })._tag).toBe("NotFound");
  });
});
