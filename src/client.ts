import { HttpBody, HttpClient, HttpClientError, HttpClientRequest } from "@effect/platform";
import { Effect, Schema } from "effect";
import { PlanetScaleCredentials } from "./credentials";

// API Error Response Schema - parse just the code, keep the rest as unknown
const ApiErrorResponse = Schema.Struct({
  code: Schema.String,
});

// Annotation symbols
export const ApiErrorCode = Symbol.for("planetscale/ApiErrorCode");
export const ApiMethod = Symbol.for("planetscale/ApiMethod");
export const ApiPath = Symbol.for("planetscale/ApiPath");
export const ApiPathParams = Symbol.for("planetscale/ApiPathParams");

// Type for HTTP methods
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Generic API Error
export class PlanetScaleApiError extends Schema.TaggedError<PlanetScaleApiError>()(
  "PlanetScaleApiError",
  {
    body: Schema.Unknown,
  },
) {}

// Schema parse error wrapper
export class PlanetScaleParseError extends Schema.TaggedError<PlanetScaleParseError>()(
  "PlanetScaleParseError",
  {
    body: Schema.Unknown,
    cause: Schema.Unknown,
  },
) {}

// Helper to get the API error code from a TaggedError class
const getErrorCode = (ErrorClass: { ast: Schema.Schema.Any["ast"] }): string | undefined => {
  const ast = ErrorClass.ast;
  // TaggedError creates a Transformation, the annotation is on the 'to' node
  if (ast._tag === "Transformation") {
    return ast.to.annotations[ApiErrorCode] as string | undefined;
  }
  return ast.annotations[ApiErrorCode] as string | undefined;
};

// Type for an annotated error class - must have an ast property and be constructable
interface AnnotatedErrorClass {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (props: any): any;
  ast: Schema.Schema.Any["ast"];
}

// Create error matcher from annotated error classes
const createErrorMatcher = <E extends AnnotatedErrorClass>(
  errors: readonly E[],
  inputToProps: (input: unknown) => Record<string, unknown>,
) => {
  return (
    input: unknown,
    errorBody: unknown,
  ): Effect.Effect<never, InstanceType<E> | PlanetScaleApiError> => {
    const parsed = Schema.decodeUnknownSync(ApiErrorResponse)(errorBody);
    for (const ErrorClass of errors) {
      const code = getErrorCode(ErrorClass);
      if (code === parsed.code) {
        return Effect.fail(
          new ErrorClass({
            ...inputToProps(input),
            message: (errorBody as { message?: string }).message ?? "",
          }) as InstanceType<E>,
        );
      }
    }
    return Effect.fail(new PlanetScaleApiError({ body: errorBody }));
  };
};

// Operation configuration
interface OperationConfig<
  I extends Schema.Schema.Any,
  O extends Schema.Schema.Any,
  E extends AnnotatedErrorClass,
> {
  inputSchema: I;
  outputSchema: O;
  errors: readonly E[];
}

// Helper to get annotation from schema AST
const getAnnotation = <T>(schema: Schema.Schema.Any, key: symbol): T | undefined => {
  return schema.ast.annotations[key] as T | undefined;
};

// API namespace
export const API = {
  make: <I extends Schema.Schema.Any, O extends Schema.Schema.Any, E extends AnnotatedErrorClass>(
    configFn: () => OperationConfig<I, O, E>,
  ) => {
    const config = configFn();
    type Input = Schema.Schema.Type<I>;
    type Output = Schema.Schema.Type<O>;
    type Errors =
      | InstanceType<E>
      | PlanetScaleApiError
      | PlanetScaleParseError
      | HttpClientError.HttpClientError
      | HttpBody.HttpBodyError;
    type Context = PlanetScaleCredentials | HttpClient.HttpClient;

    // Read method and path from input schema annotations
    const method = getAnnotation<HttpMethod>(config.inputSchema, ApiMethod);
    const path = getAnnotation<(input: Input) => string>(config.inputSchema, ApiPath);
    const pathParams = getAnnotation<readonly string[]>(config.inputSchema, ApiPathParams) ?? [];

    if (!method) {
      throw new Error("Input schema must have ApiMethod annotation");
    }
    if (!path) {
      throw new Error("Input schema must have ApiPath annotation");
    }

    const matchApiError = createErrorMatcher(
      config.errors,
      (input) => input as Record<string, unknown>,
    );

    // Helper to extract body params (non-path params) from input
    const getBodyParams = (input: Input): Record<string, unknown> | undefined => {
      if (method === "GET") return undefined;
      const pathParamSet = new Set(pathParams);
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
        if (!pathParamSet.has(key) && value !== undefined) {
          body[key] = value;
        }
      }
      return Object.keys(body).length > 0 ? body : undefined;
    };

    return (input: Input): Effect.Effect<Output, Errors, Context> =>
      Effect.gen(function* () {
        const { token, apiBaseUrl } = yield* PlanetScaleCredentials;
        const client = yield* HttpClient.HttpClient;

        const requestBody = getBodyParams(input);
        let request = HttpClientRequest.make(method)(apiBaseUrl + path(input)).pipe(
          HttpClientRequest.setHeader("Authorization", token),
          HttpClientRequest.setHeader("Content-Type", "application/json"),
        );
        if (requestBody) {
          request = yield* HttpClientRequest.bodyJson(requestBody)(request);
        }

        const response = yield* client.execute(request).pipe(Effect.scoped);

        if (response.status >= 400) {
          const errorBody = yield* response.json;
          return yield* matchApiError(input, errorBody);
        }

        const responseBody = yield* response.json;
        return yield* Schema.decodeUnknown(config.outputSchema)(responseBody).pipe(
          Effect.catchTag("ParseError", (cause) =>
            Effect.fail(new PlanetScaleParseError({ body: responseBody, cause })),
          ),
        ) as Effect.Effect<Output, Errors>;
      });
  },
};
