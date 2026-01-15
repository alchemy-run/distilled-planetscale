import { FetchHttpClient, HttpClient } from "@effect/platform";
import { Context, Effect, Layer, Schedule } from "effect";
import { Credentials, CredentialsFromEnv } from "../src/credentials";
import { createDatabase } from "../src/operations/createDatabase";
import { deleteDatabase } from "../src/operations/deleteDatabase";
import { getDatabase, GetDatabaseOutput } from "../src/operations/getDatabase";

// Deterministic database names for test suites
const MYSQL_TEST_DB_NAME = "distilled-test-mysql";
const POSTGRES_TEST_DB_NAME = "distilled-test-postgres";

// Context required by all database operations
type DatabaseContext = Credentials | HttpClient.HttpClient;

/**
 * Poll until the database is ready.
 * PlanetScale databases go through states: pending -> ready
 */
const waitForReady = (
  organization: string,
  database: string,
): Effect.Effect<GetDatabaseOutput, never, DatabaseContext> =>
  getDatabase({ organization, database }).pipe(
    Effect.flatMap((db) =>
      db.state === "ready"
        ? Effect.succeed(db)
        : Effect.fail("not ready" as const),
    ),
    Effect.retry(
      Schedule.exponential("2 seconds").pipe(
        Schedule.intersect(Schedule.recurs(30)), // max 30 retries (~2 minutes)
      ),
    ),
    Effect.orDie, // Convert retry exhaustion to defect
  );

// ============================================================================
// Test Database Service
// ============================================================================

/**
 * Service that provides access to a test database.
 */
export interface TestDatabase {
  readonly name: string;
  readonly id: string;
  readonly kind: "mysql" | "postgresql";
  readonly organization: string;
}

/**
 * Tag for MySQL test database service.
 */
export class MySqlTestDatabase extends Context.Tag("MySqlTestDatabase")<
  MySqlTestDatabase,
  TestDatabase
>() {}

/**
 * Tag for PostgreSQL test database service.
 */
export class PostgresTestDatabase extends Context.Tag("PostgresTestDatabase")<
  PostgresTestDatabase,
  TestDatabase
>() {}

// ============================================================================
// Layers
// ============================================================================

/**
 * Base layer providing credentials and HTTP client.
 * Used as a dependency for database layers.
 */
const BaseLayer = Layer.merge(CredentialsFromEnv, FetchHttpClient.layer);

/**
 * Layer that creates/reuses a MySQL test database.
 * The database is created once when the layer is built and deleted when released.
 *
 * Uses a deterministic name so the same database is reused across test runs.
 */
export const MySqlTestDatabaseLayer: Layer.Layer<MySqlTestDatabase, never, DatabaseContext> =
  Layer.scoped(
    MySqlTestDatabase,
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      // Try to get existing database first
      const existing = yield* getDatabase({
        organization,
        database: MYSQL_TEST_DB_NAME,
      }).pipe(Effect.option);

      if (existing._tag === "Some") {
        // Database exists, reuse it
        yield* Effect.logInfo(`Reusing existing MySQL database: ${MYSQL_TEST_DB_NAME}`);

        // Add finalizer to delete on scope close
        yield* Effect.addFinalizer(() =>
          deleteDatabase({
            organization,
            database: MYSQL_TEST_DB_NAME,
          }).pipe(
            Effect.tap(() => Effect.logInfo(`Deleted MySQL database: ${MYSQL_TEST_DB_NAME}`)),
            Effect.ignore,
          ),
        );

        // Wait for it to be ready if it's not
        if (existing.value.state !== "ready") {
          yield* waitForReady(organization, MYSQL_TEST_DB_NAME);
        }

        return {
          name: existing.value.name,
          id: existing.value.id,
          kind: existing.value.kind,
          organization,
        };
      }

      // Create new database
      yield* Effect.logInfo(`Creating MySQL database: ${MYSQL_TEST_DB_NAME}`);

      const db = yield* createDatabase({
        organization,
        name: MYSQL_TEST_DB_NAME,
        cluster_size: "PS_10",
        kind: "mysql",
      }).pipe(Effect.orDie);

      // Add finalizer to delete on scope close
      yield* Effect.addFinalizer(() =>
        deleteDatabase({
          organization,
          database: MYSQL_TEST_DB_NAME,
        }).pipe(
          Effect.tap(() => Effect.logInfo(`Deleted MySQL database: ${MYSQL_TEST_DB_NAME}`)),
          Effect.ignore,
        ),
      );

      // Wait for database to be ready
      yield* waitForReady(organization, MYSQL_TEST_DB_NAME);

      return {
        name: db.name,
        id: db.id,
        kind: db.kind,
        organization,
      };
    }).pipe(Effect.orDie),
  );

/**
 * Layer that creates/reuses a PostgreSQL test database.
 * The database is created once when the layer is built and deleted when released.
 *
 * Uses a deterministic name so the same database is reused across test runs.
 */
export const PostgresTestDatabaseLayer: Layer.Layer<PostgresTestDatabase, never, DatabaseContext> =
  Layer.scoped(
    PostgresTestDatabase,
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      // Try to get existing database first
      const existing = yield* getDatabase({
        organization,
        database: POSTGRES_TEST_DB_NAME,
      }).pipe(Effect.option);

      if (existing._tag === "Some") {
        // Database exists, reuse it
        yield* Effect.logInfo(`Reusing existing PostgreSQL database: ${POSTGRES_TEST_DB_NAME}`);

        // Add finalizer to delete on scope close
        yield* Effect.addFinalizer(() =>
          deleteDatabase({
            organization,
            database: POSTGRES_TEST_DB_NAME,
          }).pipe(
            Effect.tap(() =>
              Effect.logInfo(`Deleted PostgreSQL database: ${POSTGRES_TEST_DB_NAME}`),
            ),
            Effect.ignore,
          ),
        );

        // Wait for it to be ready if it's not
        if (existing.value.state !== "ready") {
          yield* waitForReady(organization, POSTGRES_TEST_DB_NAME);
        }

        return {
          name: existing.value.name,
          id: existing.value.id,
          kind: existing.value.kind,
          organization,
        };
      }

      // Create new database
      yield* Effect.logInfo(`Creating PostgreSQL database: ${POSTGRES_TEST_DB_NAME}`);

      const db = yield* createDatabase({
        organization,
        name: POSTGRES_TEST_DB_NAME,
        cluster_size: "PS_10",
        kind: "postgresql",
      }).pipe(Effect.orDie);

      // Add finalizer to delete on scope close
      yield* Effect.addFinalizer(() =>
        deleteDatabase({
          organization,
          database: POSTGRES_TEST_DB_NAME,
        }).pipe(
          Effect.tap(() => Effect.logInfo(`Deleted PostgreSQL database: ${POSTGRES_TEST_DB_NAME}`)),
          Effect.ignore,
        ),
      );

      // Wait for database to be ready
      yield* waitForReady(organization, POSTGRES_TEST_DB_NAME);

      return {
        name: db.name,
        id: db.id,
        kind: db.kind,
        organization,
      };
    }).pipe(Effect.orDie),
  );

/**
 * Full layer for MySQL test database including all dependencies.
 * Use this with @effect/vitest's `layer()` function.
 *
 * @example
 * ```ts
 * import { layer } from "@effect/vitest";
 * import { MySqlTestDatabaseLive, MySqlTestDatabase } from "./helpers";
 *
 * layer(MySqlTestDatabaseLive)("MySQL tests", (it) => {
 *   it.effect("should have access to test database", () =>
 *     Effect.gen(function* () {
 *       const db = yield* MySqlTestDatabase;
 *       expect(db.kind).toBe("mysql");
 *     })
 *   );
 * });
 * ```
 */
export const MySqlTestDatabaseLive = MySqlTestDatabaseLayer.pipe(Layer.provide(BaseLayer));

/**
 * Full layer for PostgreSQL test database including all dependencies.
 * Use this with @effect/vitest's `layer()` function.
 *
 * @example
 * ```ts
 * import { layer } from "@effect/vitest";
 * import { PostgresTestDatabaseLive, PostgresTestDatabase } from "./helpers";
 *
 * layer(PostgresTestDatabaseLive)("PostgreSQL tests", (it) => {
 *   it.effect("should have access to test database", () =>
 *     Effect.gen(function* () {
 *       const db = yield* PostgresTestDatabase;
 *       expect(db.kind).toBe("postgresql");
 *     })
 *   );
 * });
 * ```
 */
export const PostgresTestDatabaseLive = PostgresTestDatabaseLayer.pipe(Layer.provide(BaseLayer));

// Export the database names for reference
export { MYSQL_TEST_DB_NAME, POSTGRES_TEST_DB_NAME };
