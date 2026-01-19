import { FetchHttpClient } from "@effect/platform";
import { config } from "dotenv";
import { Effect, Layer, Schedule } from "effect";
import { Credentials, CredentialsFromEnv } from "../src/credentials";
import { createDatabase } from "../src/operations/createDatabase";
import { deleteDatabase } from "../src/operations/deleteDatabase";
import { getDatabase } from "../src/operations/getDatabase";

// Load environment variables from .env file
config();

// Main layer providing credentials and HTTP client for all tests
export const MainLayer = Layer.merge(CredentialsFromEnv, FetchHttpClient.layer);

const TEST_DATABASE_PREFIX = "distilled-test-db";

/**
 * Test database configuration
 */
export interface TestDatabaseConfig {
  readonly organization: string;
  readonly name: string;
  readonly kind: "mysql" | "postgresql";
}

// Shared state for test databases, keyed by suffix
const testDatabases: Map<string, TestDatabaseConfig> = new Map();

/**
 * Get the database name with optional suffix
 */
const getDatabaseName = (suffix?: string): string =>
  suffix ? `${TEST_DATABASE_PREFIX}-${suffix}` : TEST_DATABASE_PREFIX;

/**
 * Get the test database config. Throws if not initialized.
 * @param suffix - Optional suffix to identify the database (e.g., "branches")
 */
export const getTestDatabase = (suffix?: string): TestDatabaseConfig => {
  const key = suffix ?? "";
  const db = testDatabases.get(key);
  if (!db) {
    const dbName = getDatabaseName(suffix);
    throw new Error(
      `Test database "${dbName}" not initialized. Call setupTestDatabase(${suffix ? `"${suffix}"` : ""}) in beforeAll.`,
    );
  }
  return db;
};

/**
 * Setup the test database. Call this in beforeAll.
 * Creates the database if it doesn't exist and waits for it to be ready.
 * @param suffix - Optional suffix to identify the database (e.g., "branches" -> "distilled-test-db-branches")
 */
export const setupTestDatabase = (suffix?: string) =>
  Effect.gen(function* () {
    const { organization } = yield* Credentials;
    const databaseName = getDatabaseName(suffix);

    process.stderr.write(`[setup] Checking for existing database "${databaseName}"...\n`);

    const existing = yield* getDatabase({ organization, database: databaseName }).pipe(
      Effect.tap((db) =>
        Effect.sync(() => process.stderr.write(`[setup] Found existing database: state=${db.state}\n`)),
      ),
      Effect.catchTag("NotFound", () => {
        process.stderr.write(`[setup] Database not found, will create\n`);
        return Effect.succeed(null);
      }),
      Effect.catchTag("Forbidden", () => {
        process.stderr.write(`[setup] Forbidden error, treating as not found\n`);
        return Effect.succeed(null);
      }),
    );

    let kind: "mysql" | "postgresql";

    if (existing !== null) {
      kind = existing.kind;
    } else {
      process.stderr.write(`[setup] Creating database "${databaseName}"...\n`);
      const created = yield* createDatabase({
        organization,
        name: databaseName,
        cluster_size: "PS_10",
        kind: "mysql",
      });
      process.stderr.write(`[setup] Created database: state=${created.state}\n`);
      kind = created.kind;
    }

    process.stderr.write(`[setup] Waiting for database to be ready...\n`);

    yield* Effect.retry(
      getDatabase({ organization, database: databaseName }).pipe(
        Effect.tap((db) =>
          Effect.sync(() => process.stderr.write(`[setup] Polling database: state=${db.state}\n`)),
        ),
        Effect.flatMap((db) =>
          db.state === "ready"
            ? Effect.succeed(db)
            : Effect.fail({ _tag: "NotReady" as const, state: db.state }),
        ),
      ),
      {
        schedule: Schedule.intersect(Schedule.recurs(60), Schedule.spaced("5 seconds")),
        while: (e) => "_tag" in e && e._tag === "NotReady",
      },
    );

    process.stderr.write(`[setup] Database is ready!\n`);

    const dbConfig: TestDatabaseConfig = { organization, name: databaseName, kind };
    testDatabases.set(suffix ?? "", dbConfig);
    return dbConfig;
  }).pipe(Effect.provide(MainLayer));

/**
 * Teardown the test database. Call this in afterAll.
 * @param suffix - Optional suffix to identify the database (e.g., "branches")
 */
export const teardownTestDatabase = (suffix?: string) =>
  Effect.gen(function* () {
    const key = suffix ?? "";
    const db = testDatabases.get(key);
    if (!db) return;

    const databaseName = getDatabaseName(suffix);
    process.stderr.write(`[teardown] Deleting database "${databaseName}"...\n`);
    yield* deleteDatabase({
      organization: db.organization,
      database: databaseName,
    }).pipe(Effect.ignore);
    process.stderr.write(`[teardown] Done\n`);

    testDatabases.delete(key);
  }).pipe(Effect.provide(MainLayer));

/**
 * Run an Effect with the MainLayer provided.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const runEffect = <A, E>(effect: Effect.Effect<A, E, any>): Promise<A> =>
  Effect.runPromise(effect.pipe(Effect.provide(MainLayer)) as Effect.Effect<A, E, never>);
