import * as fs from "fs";
import * as path from "path";
import { applyAllPatches } from "./apply-patches";

// ============================================================================
// Types for OpenAPI Spec
// ============================================================================

interface OpenAPISpec {
  swagger: string;
  info: { title: string; version: string };
  basePath: string;
  paths: Record<string, PathItem>;
  definitions: Record<string, SchemaObject>;
}

interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
}

interface Operation {
  operationId: string;
  summary: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  responses: Record<string, Response>;
}

interface Parameter {
  name: string;
  in: "path" | "query" | "body" | "header";
  type?: string;
  required?: boolean;
  description?: string;
  default?: unknown;
  enum?: string[];
  schema?: SchemaObject;
}

interface Response {
  description: string;
  schema?: SchemaObject | { $ref: string };
}

interface SchemaObject {
  type?: string;
  $ref?: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  required?: string[];
  enum?: string[];
  additionalProperties?: boolean | SchemaObject;
  description?: string;
  default?: unknown;
  "x-nullable"?: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toCamelCase(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toPascalCase(s: string): string {
  return capitalize(toCamelCase(s));
}

function operationIdToFunctionName(operationId: string): string {
  return toCamelCase(operationId);
}

function operationIdToClassName(operationId: string): string {
  return toPascalCase(operationId);
}

// ============================================================================
// Schema Resolution
// ============================================================================

function resolveRef(spec: OpenAPISpec, ref: string): SchemaObject {
  const refPath = ref.replace("#/definitions/", "");
  const schema = spec.definitions[refPath];
  if (!schema) {
    throw new Error(`Could not resolve ref: ${ref}`);
  }
  return schema;
}

function getSchemaFromResponse(
  spec: OpenAPISpec,
  response: Response | undefined,
): SchemaObject | null {
  if (!response?.schema) return null;
  if ("$ref" in response.schema && response.schema.$ref) {
    return resolveRef(spec, response.schema.$ref);
  }
  return response.schema as SchemaObject;
}

// ============================================================================
// Effect Schema Generation
// ============================================================================

function openApiTypeToEffectSchema(
  prop: SchemaObject,
  spec: OpenAPISpec,
  indent: string = "",
  seenRefs: Set<string> = new Set(),
): string {
  // Handle $ref
  if (prop.$ref) {
    if (seenRefs.has(prop.$ref)) {
      return "Schema.Unknown"; // Prevent infinite recursion
    }
    const resolved = resolveRef(spec, prop.$ref);
    return openApiTypeToEffectSchema(resolved, spec, indent, new Set([...seenRefs, prop.$ref]));
  }

  // Handle enum
  if (prop.enum && prop.enum.length > 0) {
    const literals = prop.enum.map((v) => `"${v}"`).join(", ");
    const baseSchema = `Schema.Literal(${literals})`;
    return prop["x-nullable"] ? `Schema.NullOr(${baseSchema})` : baseSchema;
  }

  // Handle type
  let baseSchema: string;
  switch (prop.type) {
    case "string":
      baseSchema = "Schema.String";
      break;
    case "integer":
    case "number":
      baseSchema = "Schema.Number";
      break;
    case "boolean":
      baseSchema = "Schema.Boolean";
      break;
    case "array":
      if (prop.items) {
        const itemSchema = openApiTypeToEffectSchema(prop.items, spec, indent, seenRefs);
        baseSchema = `Schema.Array(${itemSchema})`;
      } else {
        baseSchema = "Schema.Array(Schema.Unknown)";
      }
      break;
    case "object":
      if (prop.properties) {
        baseSchema = generateStructSchema(prop, spec, indent, seenRefs);
      } else {
        baseSchema = "Schema.Unknown";
      }
      break;
    default:
      if (prop.properties) {
        baseSchema = generateStructSchema(prop, spec, indent, seenRefs);
      } else {
        baseSchema = "Schema.Unknown";
      }
      break;
  }

  // Wrap with NullOr if x-nullable is true
  return prop["x-nullable"] ? `Schema.NullOr(${baseSchema})` : baseSchema;
}

function generateStructSchema(
  schema: SchemaObject,
  spec: OpenAPISpec,
  indent: string = "",
  seenRefs: Set<string> = new Set(),
): string {
  if (!schema.properties) return "Schema.Unknown";

  const required = new Set(schema.required || []);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(schema.properties)) {
    const fieldSchema = openApiTypeToEffectSchema(value, spec, indent + "  ", seenRefs);
    const isOptional = !required.has(key);
    if (isOptional) {
      lines.push(`${indent}  ${key}: Schema.optional(${fieldSchema}),`);
    } else {
      lines.push(`${indent}  ${key}: ${fieldSchema},`);
    }
  }

  return `Schema.Struct({\n${lines.join("\n")}\n${indent}})`;
}

// ============================================================================
// Code Generation
// ============================================================================

interface GeneratedOperation {
  fileName: string;
  code: string;
  functionName: string;
  exports: string[];
}

function generateInputSchema(
  operationId: string,
  method: string,
  pathTemplate: string,
  parameters: Parameter[],
  spec: OpenAPISpec,
): { inputSchemaCode: string; inputSchemaName: string; pathParamInfos: PathParamInfo[]; inputType: string } {
  const inputSchemaName = `${toPascalCase(operationId)}Input`;
  const pathParams = parameters.filter((p) => p.in === "path");
  const queryParams = parameters.filter((p) => p.in === "query");
  const bodyParam = parameters.find((p) => p.in === "body");

  const fields: string[] = [];

  // Path parameters (always required)
  for (const param of pathParams) {
    const schema = param.enum
      ? `Schema.Literal(${param.enum.map((v) => `"${v}"`).join(", ")})`
      : param.type === "integer"
        ? "Schema.Number"
        : "Schema.String";
    fields.push(`  ${param.name}: ${schema},`);
  }

  // Query parameters
  for (const param of queryParams) {
    let schema =
      param.type === "integer" || param.type === "number"
        ? "Schema.Number"
        : param.type === "boolean"
          ? "Schema.Boolean"
          : param.enum
            ? `Schema.Literal(${param.enum.map((v) => `"${v}"`).join(", ")})`
            : "Schema.String";

    if (!param.required) {
      schema = `Schema.optional(${schema})`;
    }
    fields.push(`  ${param.name}: ${schema},`);
  }

  // Body parameters
  if (bodyParam?.schema) {
    const bodySchema = bodyParam.schema;
    if (bodySchema.properties) {
      const required = new Set(bodySchema.required || []);
      for (const [key, value] of Object.entries(bodySchema.properties)) {
        let fieldSchema = openApiTypeToEffectSchema(value, spec, "  ");
        if (!required.has(key)) {
          fieldSchema = `Schema.optional(${fieldSchema})`;
        }
        fields.push(`  ${key}: ${fieldSchema},`);
      }
    }
  }

  // Build path param info for error schemas
  const pathParamInfos: PathParamInfo[] = pathParams.map((p) => ({
    name: p.name,
    type: p.type || "string",
  }));
  const pathParamNames = pathParamInfos.map((p) => p.name);
  const inputTypeFields = pathParamNames.map((n) => `${n}: string`).join("; ");
  const inputType = inputTypeFields ? `{ ${inputTypeFields} }` : "Record<string, never>";

  // Build path template function
  const pathFn = pathParamNames.length
    ? `(input: ${inputType}) => \`${pathTemplate.replace(/{(\w+)}/g, "${input.$1}")}\``
    : `() => "${pathTemplate}"`;

  const inputSchemaCode = `export const ${inputSchemaName} = Schema.Struct({
${fields.join("\n")}
}).annotations({
  [ApiMethod]: "${method.toUpperCase()}",
  [ApiPath]: ${pathFn},
});
export type ${inputSchemaName} = typeof ${inputSchemaName}.Type;`;

  return { inputSchemaCode, inputSchemaName, pathParamInfos, inputType };
}

function generateOutputSchema(
  operationId: string,
  responseSchema: SchemaObject | null,
  spec: OpenAPISpec,
): { outputSchemaCode: string; outputSchemaName: string } {
  const outputSchemaName = toPascalCase(operationId) + "Output";

  if (!responseSchema) {
    return {
      outputSchemaCode: `export const ${outputSchemaName} = Schema.Void;
export type ${outputSchemaName} = typeof ${outputSchemaName}.Type;`,
      outputSchemaName,
    };
  }

  // Handle array responses
  if (responseSchema.type === "array" && responseSchema.items) {
    const itemSchema = openApiTypeToEffectSchema(responseSchema.items, spec, "");
    return {
      outputSchemaCode: `export const ${outputSchemaName} = Schema.Array(${itemSchema});
export type ${outputSchemaName} = typeof ${outputSchemaName}.Type;`,
      outputSchemaName,
    };
  }

  // Handle object responses
  const schemaCode = openApiTypeToEffectSchema(responseSchema, spec, "");
  return {
    outputSchemaCode: `export const ${outputSchemaName} = ${schemaCode};
export type ${outputSchemaName} = typeof ${outputSchemaName}.Type;`,
    outputSchemaName,
  };
}

interface PathParamInfo {
  name: string;
  type: string;
}

function generateErrorClasses(
  operationId: string,
  responses: Record<string, Response>,
  pathParamInfos: PathParamInfo[],
): { errorCode: string; errorNames: string[] } {
  const className = toPascalCase(operationId);
  const errorNames: string[] = [];
  const errorClasses: string[] = [];

  // Map HTTP status codes to error codes
  const statusToCode: Record<string, string> = {
    "401": "unauthorized",
    "403": "forbidden",
    "404": "not_found",
    "409": "conflict",
    "422": "unprocessable_entity",
  };

  for (const [status, _response] of Object.entries(responses)) {
    const code = statusToCode[status];
    if (!code) continue;

    const errorName = `${className}${toPascalCase(code.replace(/_/g, " ").replace(/ /g, ""))}`;
    errorNames.push(errorName);

    // Use NumberFromString for integer params so error constructors accept
    // both the numeric input value and potential string API responses
    const paramFields = pathParamInfos
      .map((p) => {
        const schema = p.type === "integer" ? "Schema.NumberFromString" : "Schema.String";
        return `    ${p.name}: ${schema},`;
      })
      .join("\n");

    errorClasses.push(`export class ${errorName} extends Schema.TaggedError<${errorName}>()(
  "${errorName}",
  {
${paramFields}
    message: Schema.String,
  },
  { [ApiErrorCode]: "${code}" },
) {}`);
  }

  return {
    errorCode: errorClasses.join("\n\n"),
    errorNames,
  };
}

function generateOperation(
  spec: OpenAPISpec,
  pathTemplate: string,
  method: string,
  operation: Operation,
): GeneratedOperation {
  const operationId = operation.operationId;
  const functionName = operationIdToFunctionName(operationId);
  const parameters = operation.parameters || [];

  // Generate input schema
  const { inputSchemaCode, inputSchemaName, pathParamInfos } = generateInputSchema(
    operationId,
    method,
    pathTemplate,
    parameters,
    spec,
  );

  // Get success response (200 or 201)
  const successResponse =
    operation.responses["200"] || operation.responses["201"] || operation.responses["204"];
  const responseSchema = getSchemaFromResponse(spec, successResponse);

  // Generate output schema
  const { outputSchemaCode, outputSchemaName } = generateOutputSchema(
    operationId,
    responseSchema,
    spec,
  );

  // Generate error classes
  const { errorCode, errorNames } = generateErrorClasses(operationId, operation.responses, pathParamInfos);

  // Generate the operation function
  const errorsArray =
    errorNames.length > 0 ? `[${errorNames.join(", ")}]` : "[]";

  const operationCode = `export const ${functionName} = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ${inputSchemaName},
  outputSchema: ${outputSchemaName},
  errors: ${errorsArray},
}));`;

  // Combine all code
  const imports = `import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";`;

  const code = [
    imports,
    "",
    "// Input Schema",
    inputSchemaCode,
    "",
    "// Output Schema",
    outputSchemaCode,
    "",
    errorNames.length > 0 ? "// Error Schemas" : "",
    errorCode,
    "",
    "// The operation",
    operationCode,
    "",
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  const exports = [inputSchemaName, outputSchemaName, ...errorNames, functionName];

  return {
    fileName: `${functionName}.ts`,
    code,
    functionName,
    exports,
  };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const specsDir = path.join(process.cwd(), "specs");
  const specPath = path.join(specsDir, "openapi.json");
  const operationsDir = path.join(process.cwd(), "src/operations");
  const indexPath = path.join(process.cwd(), "index.ts");

  // Read the OpenAPI spec
  console.log("Reading OpenAPI spec...");
  const specContent = fs.readFileSync(specPath, "utf-8");
  const spec: OpenAPISpec = JSON.parse(specContent);

  // Apply patches
  console.log("Applying patches...");
  const { applied, errors } = applyAllPatches(spec, specsDir);
  for (const msg of applied) {
    console.log(`  ✓ ${msg}`);
  }
  if (errors.length > 0) {
    console.log("\nPatch errors:");
    for (const msg of errors) {
      console.log(`  ✗ ${msg}`);
    }
    process.exit(1);
  }
  console.log("");

  // Create operations directory if it doesn't exist
  if (!fs.existsSync(operationsDir)) {
    fs.mkdirSync(operationsDir, { recursive: true });
  }

  // Collect all operations
  const operations: GeneratedOperation[] = [];

  for (const [pathTemplate, pathItem] of Object.entries(spec.paths)) {
    for (const method of ["get", "post", "put", "patch", "delete"] as const) {
      const operation = pathItem[method];
      if (!operation) continue;

      console.log(`Generating ${method.toUpperCase()} ${pathTemplate} (${operation.operationId})...`);

      try {
        const generated = generateOperation(spec, pathTemplate, method, operation);
        operations.push(generated);
      } catch (error) {
        console.error(`Error generating ${operation.operationId}:`, error);
      }
    }
  }

  // Write all operation files
  for (const op of operations) {
    const filePath = path.join(operationsDir, op.fileName);
    fs.writeFileSync(filePath, op.code);
    console.log(`Written: ${op.fileName}`);
  }

  // Update index.ts
  console.log("\nUpdating index.ts...");
  const baseExports = [
    'export * from "./src/errors";',
    'export * from "./src/credentials";',
    'export * from "./src/client";',
  ];

  const operationExports = operations.map(
    (op) => `export * from "./src/operations/${op.functionName}";`,
  );

  const indexContent = [...baseExports, ...operationExports].join("\n") + "\n";
  fs.writeFileSync(indexPath, indexContent);

  console.log(`\nGenerated ${operations.length} operations.`);
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
