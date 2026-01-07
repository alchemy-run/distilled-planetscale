import {
  HttpClient,
  HttpClientError,
  HttpClientRequest,
} from "@effect/platform";
import { Effect, Schema } from "effect";
import { API_BASE_URL, PlanetScaleCredentials } from "./credentials";

// API Error Response Schema - parse just the code, keep the rest as unknown
const ApiErrorResponse = Schema.Struct({
  code: Schema.String,
});

// Error code annotation symbol
export const ApiErrorCode = Symbol.for("planetscale/ApiErrorCode");

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
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: (input: Schema.Schema.Type<I>) => string;
  inputSchema: I;
  outputSchema: O;
  errors: readonly E[];
}

// Make a generic API operation
export const makeOperation = <
  I extends Schema.Schema.Any,
  O extends Schema.Schema.Any,
  E extends AnnotatedErrorClass,
>(
  config: OperationConfig<I, O, E>,
) => {
  type Output = Schema.Schema.Type<O>;
  type Errors = InstanceType<E> | PlanetScaleApiError | PlanetScaleParseError | HttpClientError.HttpClientError;
  type Context = PlanetScaleCredentials | HttpClient.HttpClient;

  const matchApiError = createErrorMatcher(config.errors, (input) => input as Record<string, unknown>);

  return (input: Schema.Schema.Type<I>): Effect.Effect<Output, Errors, Context> =>
    Effect.gen(function* () {
      const { token } = yield* PlanetScaleCredentials;
      const client = yield* HttpClient.HttpClient;

      const request = (() => {
        switch (config.method) {
          case "GET":
            return HttpClientRequest.get(API_BASE_URL + config.path(input));
          case "POST":
            return HttpClientRequest.post(API_BASE_URL + config.path(input));
          case "PUT":
            return HttpClientRequest.put(API_BASE_URL + config.path(input));
          case "PATCH":
            return HttpClientRequest.patch(API_BASE_URL + config.path(input));
          case "DELETE":
            return HttpClientRequest.del(API_BASE_URL + config.path(input));
        }
      })();

      const response = yield* request.pipe(
        HttpClientRequest.setHeader("Authorization", token),
        HttpClientRequest.setHeader("Content-Type", "application/json"),
        client.execute,
        Effect.scoped,
      );

      if (response.status >= 400) {
        const errorBody = yield* response.json;
        return yield* matchApiError(input, errorBody);
      }

      const body = yield* response.json;
      return yield* Schema.decodeUnknown(config.outputSchema)(body).pipe(
        Effect.catchTag("ParseError", (cause) =>
          Effect.fail(new PlanetScaleParseError({ body, cause })),
        ),
      ) as Effect.Effect<Output, Errors>;
    });
};
