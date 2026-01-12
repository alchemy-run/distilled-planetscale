import { Effect } from "effect";
import { spawn } from "child_process";
import { parseArgs } from "util";

const TODO_FILE_PATH = "todo-tests.md";

/**
 * Reads todo-tests.md and returns an array of unchecked operation names
 */
export const getUncheckedOperations = Effect.gen(function* () {
  const file = Bun.file(TODO_FILE_PATH);
  const content = yield* Effect.tryPromise(() => file.text());

  const lines = content.split("\n");
  const uncheckedOperations: string[] = [];

  for (const line of lines) {
    // Match unchecked items (- [ ] operationName)
    const uncheckedMatch = line.match(/^-\s+\[\s\]\s+(\w+)$/);
    if (uncheckedMatch) {
      const operation = uncheckedMatch[1];
      if (operation) {
        uncheckedOperations.push(operation);
      }
    }
  }

  return uncheckedOperations;
});

/**
 * Marks an operation as complete in todo-tests.md
 */
export const markOperationComplete = (operationName: string) =>
  Effect.gen(function* () {
    const file = Bun.file(TODO_FILE_PATH);
    const content = yield* Effect.tryPromise(() => file.text());

    // Replace "- [ ] operationName" with "- [x] operationName"
    const updated = content.replace(
      new RegExp(`^(- \\[) (\\] ${operationName})$`, "m"),
      "$1x$2",
    );

    yield* Effect.tryPromise(() => Bun.write(TODO_FILE_PATH, updated));
  });

/**
 * Spawns an opencode instance to write a test for the given operation.
 * Output is streamed to the console.
 */
export const writeTestForOperation = (operationName: string) =>
  Effect.async<void, Error>((resume) => {
    const prompt = `Write a test for the "${operationName}" operation.

IMPORTANT:
- Follow the test patterns in AGENTS.md
- Make sure to clean up any resources created during the test using Effect.ensuring
- Use unique names with timestamps for any resources created
- Test both success cases and error handling
- After writing the test, run it to verify it works

Look at existing tests in the tests/ directory for examples.`;

    const child = spawn("opencode", ["run", "-m", "anthropic/claude-opus-4-5", prompt], {
      stdio: ["inherit", "inherit", "inherit"],
      shell: true,
    });

    child.on("error", (err) => {
      resume(Effect.fail(err));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resume(Effect.succeed(undefined));
      } else {
        resume(Effect.fail(new Error(`opencode exited with code ${code}`)));
      }
    });
  });

// Main entry point
async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      limit: {
        type: "string",
        short: "l",
      },
    },
  });

  const limit = values.limit ? parseInt(values.limit, 10) : undefined;

  const program = Effect.gen(function* () {
    const allOperations = yield* getUncheckedOperations;
    const operations = limit ? allOperations.slice(0, limit) : allOperations;
    const total = allOperations.length;

    console.log(`Found ${total} unchecked operations`);
    if (limit) {
      console.log(`Limiting to ${limit} operation(s)`);
    }

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i]!;
      console.log("\n" + "=".repeat(60));
      console.log(`OPERATION ${i + 1}/${operations.length}: ${operation}`);
      console.log("=".repeat(60) + "\n");

      yield* writeTestForOperation(operation);
      yield* markOperationComplete(operation);
      console.log(`Marked ${operation} as complete in ${TODO_FILE_PATH}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("ALL OPERATIONS COMPLETE");
    console.log("=".repeat(60) + "\n");
  });

  await Effect.runPromise(program);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
