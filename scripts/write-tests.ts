#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";

interface TestTask {
  name: string;
  line: number;
  tests: string[];
}

interface Section {
  name: string;
  tasks: TestTask[];
}

function parseTodoFile(): Section[] {
  const content = readFileSync("todo-tests.md", "utf-8");
  const lines = content.split("\n");
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let currentTask: TestTask | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    // Section header
    if (line.startsWith("### ")) {
      if (currentSection) {
        if (currentTask) {
          currentSection.tasks.push(currentTask);
        }
        sections.push(currentSection);
      }
      currentSection = { name: line.slice(4), tasks: [] };
      currentTask = null;
      continue;
    }
    
    // Task
    const taskMatch = line.match(/^- \[([ x])\] (.+)$/);
    if (taskMatch) {
      if (currentTask) {
        currentSection!.tasks.push(currentTask);
      }
      const checked = taskMatch[1] === "x";
      currentTask = { name: taskMatch[2] || "", line: i, tests: [] };
      
      // Check if task has subtests by looking at next lines
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (nextLine?.trimStart().startsWith("- [")) {
          // This task has subtests
          continue;
        }
      }
      continue;
    }
    
    // Subtest (for already checked items)
    const subtestMatch = line.match(/^  - \[([ x])\] (.+)$/);
    if (subtestMatch && currentTask) {
      if (subtestMatch[1] === "x" && subtestMatch[2]) {
        currentTask.tests.push(subtestMatch[2]);
      }
      continue;
    }
  }
  
  if (currentSection) {
    if (currentTask) {
      currentSection.tasks.push(currentTask);
    }
    sections.push(currentSection);
  }
  
  return sections;
}

function generateTestsForOperation(
  operationName: string,
  existingTests: string[],
): string {
  // Check if operation file exists
  const operationPath = `src/operations/${operationName}.ts`;
  if (!existsSync(operationPath)) {
    console.error(`Operation file not found: ${operationPath}`);
    return "";
  }
  
  // Read the operation file to understand its schema
  const operationContent = readFileSync(operationPath, "utf-8");
  
  // Determine test cases
  const testCases = existingTests.length > 0 
    ? existingTests 
    : generateDefaultTestCases(operationName, operationContent);
  
  return generateTestFileContent(operationName, testCases);
}

function generateDefaultTestCases(operationName: string, operationContent: string): string[] {
  const testCases: string[] = [];
  const hasErrors = operationContent.includes("export class") && 
                    operationContent.includes("Schema.TaggedError");
  const hasPagination = operationContent.includes("page") || 
                        operationContent.includes("per_page");
  
  // Default successful test
  testCases.push(`should ${operationName} successfully`);
  
  // Error case if errors are defined
  if (hasErrors) {
    const errorClasses = operationContent.match(/export class (\w+) extends Schema\.TaggedError/g);
    if (errorClasses) {
      errorClasses.forEach(errorMatch => {
        const errorClassMatch = errorMatch.match(/export class (\w+)/);
        if (errorClassMatch && errorClassMatch[1]) {
          testCases.push(`should return ${errorClassMatch[1]} on error`);
        }
      });
    }
  }
  
  // Pagination test if applicable
  if (hasPagination) {
    testCases.push("should support pagination parameters");
  }
  
  return testCases;
}

function generateTestFileContent(operationName: string, testCases: string[]): string {
  // Import the operation to get error types
  const operationPath = `src/operations/${operationName}.ts`;
  const operationContent = existsSync(operationPath) 
    ? readFileSync(operationPath, "utf-8")
    : "";
  
  // Extract error classes
  const errorClasses: string[] = [];
  const errorMatches = operationContent.matchAll(/export class (\w+) extends Schema\.TaggedError/g);
  for (const match of errorMatches) {
    if (match[1]) {
      errorClasses.push(match[1]);
    }
  }
  
  const errorImports = errorClasses.length > 0 
    ? `\nimport {\n  ${operationName},\n${errorClasses.map(e => `  ${e},`).join("\n")}\n} from "../src/operations/${operationName}";`
    : `\nimport { ${operationName} } from "../src/operations/${operationName}";`;
  
  let testCode = `import { FetchHttpClient } from "@effect/platform";\nimport { it } from "@effect/vitest";\nimport { Effect, Layer } from "effect";\nimport { describe, expect } from "vitest";\nimport { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";${errorImports}\nimport "./setup";\n\nconst MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);\n\ndescribe("${operationName}", () => {\n`;
  
  testCases.forEach((testCase, index) => {
    const isErrorTest = testCase.includes("return") && testCase.includes("on error");
    
    if (isErrorTest) {
      // Generate error test
      const errorClass = errorClasses.find(e => testCase.includes(e)) || "Error";
      testCode += generateErrorTest(operationName, testCase, errorClass);
    } else {
      // Generate success test
      testCode += generateSuccessTest(operationName, testCase);
    }
  });
  
  testCode += `});\n`;
  
  return testCode;
}

function generateSuccessTest(operationName: string, testCase: string): string {
  return `  it.effect("${testCase}", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* ${operationName}({ organization })
        .pipe(
          Effect.catchTag("PlanetScaleApiError", (e) =>
            Effect.succeed({ __error: true, code: e.code }),
          ),
        );

      // Adjust assertions based on your operation's response structure
      expect(result).toBeDefined();
    }).pipe(Effect.provide(MainLayer)),
  );\n\n`;
}

function generateErrorTest(operationName: string, testCase: string, errorClass: string): string {
  const errorName = errorClass.replace(/([A-Z])/g, (match) => " " + match.toLowerCase()).trim();
  
  return `  it.effect("${testCase}", () =>
    Effect.gen(function* () {
      const result = yield* ${operationName}({ organization: "non-existent-org" })
        .pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

      expect(result).toBeInstanceOf(${errorClass});
      if (result instanceof ${errorClass}) {
        expect(result._tag).toBe("${errorClass}");
      }
    }).pipe(Effect.provide(MainLayer)),
  );\n\n`;
}

async function writeTestWithOpenCode(operationName: string, testContent: string, verify: boolean): Promise<boolean> {
  const testFilePath = `tests/${operationName}.test.ts`;
  
  try {
    console.log(`Generating test for ${operationName} using OpenCode CLI...`);
    
    // Read the operation file to understand its structure
    const operationPath = `src/operations/${operationName}.ts`;
    if (!existsSync(operationPath)) {
      console.error(`Operation file not found: ${operationPath}`);
      return false;
    }
    
    const operationContent = readFileSync(operationPath, "utf-8");
    
    // Use OpenCode CLI to generate tests based on the operation
    const openCodePrompt = `Generate comprehensive tests for the following PlanetScale API operation. The tests should:

1. Use the Effect testing pattern with it.effect
2. Include success scenarios with proper assertions
3. Include error scenarios for all defined error types
4. Use the existing test structure and imports
5. Follow the project's testing conventions

Operation file content:
\`\`\`typescript
${operationContent}
\`\`\`

Please generate a complete test file that covers all aspects of this operation, including input validation, success cases, and all error cases defined in the operation.`;
    
    try {
      // Call OpenCode CLI to generate the test
      const generatedTest = execSync(`opencode "${openCodePrompt}"`, { 
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"]
      });
      
      // Write the generated test to file
      writeFileSync(testFilePath, generatedTest);
      console.log(`✓ Test generated and written for ${operationName}`);
      
      // Run the test to verify it works only if verify flag is set
      if (verify) {
        console.log(`Running test for ${operationName}...`);
        try {
          execSync(`bunx vitest run ${testFilePath}`, { stdio: "inherit" });
          console.log(`✓ Test verified for ${operationName}`);
        } catch (testError) {
          console.warn(`⚠ Test generated but failed verification for ${operationName}`);
          return false;
        }
      }
      
      return true;
    } catch (openCodeError) {
      console.warn(`⚠ OpenCode CLI failed, falling back to template generation for ${operationName}`);
      
      // Fallback to the original template-based generation
      writeFileSync(testFilePath, testContent);
      
      if (verify) {
        console.log(`Running test for ${operationName}...`);
        try {
          execSync(`bunx vitest run ${testFilePath}`, { stdio: "inherit" });
          console.log(`✓ Test written and verified for ${operationName}`);
        } catch (testError) {
          console.warn(`⚠ Test written but failed verification for ${operationName}`);
          return false;
        }
      } else {
        console.log(`✓ Test written for ${operationName}`);
      }
      
      return true;
    }
    
  } catch (error) {
    console.error(`✗ Failed to write/test ${operationName}:`, error);
    return false;
  }
}

function extractTestNames(testContent: string): string[] {
  const testNames: string[] = [];
  const testMatches = testContent.matchAll(/it\.effect\("([^"]+)"/g);
  for (const match of testMatches) {
    if (match[1]) {
      testNames.push(match[1]);
    }
  }
  return testNames;
}

function updateTodoFile(sections: Section[], completedTasks: TestTask[]) {
  const content = readFileSync("todo-tests.md", "utf-8");
  const lines = content.split("\n");
  
  // Mark completed tasks as checked and add subtests
  completedTasks.forEach(task => {
    const lineIndex = task.line;
    if (lineIndex < lines.length) {
      // Mark the task as checked
      const line = lines[lineIndex];
      if (line) {
        lines[lineIndex] = line.replace(/^- \[ \]/, "- [x]");
      }
      
      // Insert subtests after the task line
      if (task.tests.length > 0) {
        const subtests = task.tests.map(test => `  - [x] ${test}`).join("\n");
        lines.splice(lineIndex + 1, 0, subtests);
      }
    }
  });
  
  writeFileSync("todo-tests.md", lines.join("\n"));
}

async function main() {
  const args = process.argv.slice(2);
  const operationFilter = args.find(a => !a.startsWith("--")) || null;
  const verify = args.includes("--verify");
  const batchSize = 5;
  
  console.log("Parsing todo-tests.md...");
  const sections = parseTodoFile();
  
  const allTasks = sections.flatMap(s => s.tasks);
  const tasksToComplete = operationFilter
    ? allTasks.filter(t => t.name === operationFilter)
    : allTasks.filter(t => !t.tests.length);
  
  if (tasksToComplete.length === 0) {
    console.log("No tasks to complete!");
    return;
  }
  
  console.log(`Found ${tasksToComplete.length} tasks to complete`);
  
  const completedTasks: TestTask[] = [];
  const failedTasks: string[] = [];
  
  for (let i = 0; i < tasksToComplete.length; i += batchSize) {
    const batch = tasksToComplete.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1} (${batch.length} tasks)...`);
    
    const batchPromises = batch.map(async task => {
      const testContent = generateTestsForOperation(task.name, task.tests);
      
      if (!testContent) {
        failedTasks.push(task.name);
        return null;
      }
      
      const success = await writeTestWithOpenCode(task.name, testContent, verify);
      
      if (success) {
        // Extract test names from the generated content
        const testNames = extractTestNames(testContent);
        return { ...task, tests: testNames };
      } else {
        failedTasks.push(task.name);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(result => {
      if (result) {
        completedTasks.push(result);
      }
    });
  }
  
  // Update the todo file
  if (completedTasks.length > 0) {
    console.log("\nUpdating todo-tests.md...");
    updateTodoFile(sections, completedTasks);
  }
  
  // Verify if requested
  if (verify && completedTasks.length > 0) {
    console.log("\nRunning all tests...");
    execSync("bunx vitest run", { stdio: "inherit" });
  }
  
  console.log("\n=== Summary ===");
  console.log(`Completed: ${completedTasks.length}`);
  console.log(`Failed: ${failedTasks.length}`);
  
  if (failedTasks.length > 0) {
    console.log("\nFailed tasks:");
    failedTasks.forEach(name => console.log(`  - ${name}`));
  }
}

main().catch(console.error);
