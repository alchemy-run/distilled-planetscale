import { HttpBody, HttpClient, HttpClientError, HttpClientRequest } from "@effect/platform";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Category from "./category";
import { PlanetScaleCredentials } from "./credentials";
import {
  type PaginatedResponse,
  type PaginatedTrait,
  DefaultPaginationTrait,
  getPath,
} from "./pagination";

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

// Generic API Error - uncategorized fallback for unknown API error codes
export class PlanetScaleApiError extends Schema.TaggedError<PlanetScaleApiError>()(
  "PlanetScaleApiError",
  {
    body: Schema.Unknown,
  },
).pipe(Category.withServerError) {}

// Schema parse error wrapper
export class PlanetScaleParseError extends Schema.TaggedError<PlanetScaleParseError>()(
  "PlanetScaleParseError",
  {
    body: Schema.Unknown,
    cause: Schema.Unknown,
  },
).pipe(Category.withParseError) {}

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

// Paginated operation configuration
interface PaginatedOperationConfig<
  I extends Schema.Schema.Any,
  O extends Schema.Schema.Any,
  E extends AnnotatedErrorClass,
> extends OperationConfig<I, O, E> {
  /** Pagination trait describing the input/output token fields */
  pagination?: PaginatedTrait;
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

    // Helper to extract query params (non-path params) for GET requests
    const getQueryParams = (input: Input): Record<string, string> | undefined => {
      if (method !== "GET") return undefined;
      const pathParamSet = new Set(pathParams);
      const query: Record<string, string> = {};
      for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
        if (!pathParamSet.has(key) && value !== undefined) {
          query[key] = String(value);
        }
      }
      return Object.keys(query).length > 0 ? query : undefined;
    };

    // Helper to extract body params (non-path params) for non-GET requests
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

        const queryParams = getQueryParams(input);
        const requestBody = getBodyParams(input);
        let request = HttpClientRequest.make(method)(apiBaseUrl + path(input)).pipe(
          HttpClientRequest.setHeader("Authorization", token),
          HttpClientRequest.setHeader("Content-Type", "application/json"),
        );
        if (queryParams) {
          request = HttpClientRequest.setUrlParams(request, queryParams);
        }
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

  /**
   * Creates a paginated operation that returns an Effect for a single page,
   * plus `.pages()` and `.items()` methods for streaming all pages/items.
   *
   * @example
   * ```ts
   * const listDatabases = API.makePaginated(() => ({
   *   inputSchema: ListDatabasesInput,
   *   outputSchema: ListDatabasesOutput,
   *   errors: [ListDatabasesNotfound],
   * }));
   *
   * // Single page
   * const page1 = listDatabases({ organization: "my-org" });
   *
   * // Stream all pages
   * const allPages = listDatabases.pages({ organization: "my-org" });
   *
   * // Stream all items
   * const allDatabases = listDatabases.items({ organization: "my-org" });
   * ```
   */
  makePaginated: <
    I extends Schema.Schema.Any,
    O extends Schema.Schema.Any,
    E extends AnnotatedErrorClass,
  >(
    configFn: () => PaginatedOperationConfig<I, O, E>,
  ) => {
    const config = configFn();
    const pagination = config.pagination ?? DefaultPaginationTrait;

    // Create the base operation using API.make
    const baseFn = API.make(() => ({
      inputSchema: config.inputSchema,
      outputSchema: config.outputSchema,
      errors: config.errors,
    }));

    type Input = Schema.Schema.Type<I>;
    type Output = Schema.Schema.Type<O>;
    type Errors =
      | InstanceType<E>
      | PlanetScaleApiError
      | PlanetScaleParseError
      | HttpClientError.HttpClientError
      | HttpBody.HttpBodyError;
    type Context = PlanetScaleCredentials | HttpClient.HttpClient;

    // Stream all pages (full response objects)
    const pagesFn = (input: Omit<Input, "page">): Stream.Stream<Output, Errors, Context> => {
      type State = { page: number; done: boolean };

      const unfoldFn = (state: State) =>
        Effect.gen(function* () {
          if (state.done) {
            return Option.none();
          }

          // Build the request with the page number
          const requestPayload = {
            ...input,
            [pagination.inputToken]: state.page,
          } as Input;

          // Make the API call
          const response = yield* baseFn(requestPayload);

          // Extract the next page number
          const nextPage = getPath(response, pagination.outputToken) as number | null | undefined;

          // Return the full page and next state
          const nextState: State = {
            page: nextPage ?? state.page + 1,
            done: nextPage === null || nextPage === undefined,
          };

          return Option.some([response, nextState] as const);
        });

      return Stream.unfoldEffect({ page: 1, done: false } as State, unfoldFn);
    };

    // Stream individual items from the paginated field
    const itemsFn = (
      input: Omit<Input, "page">,
    ): Stream.Stream<
      Output extends PaginatedResponse<infer Item> ? Item : unknown,
      Errors,
      Context
    > => {
      return pagesFn(input).pipe(
        Stream.flatMap((page) => {
          const items = getPath(page, pagination.items) as readonly unknown[] | undefined;
          return Stream.fromIterable(items ?? []);
        }),
      ) as Stream.Stream<
        Output extends PaginatedResponse<infer Item> ? Item : unknown,
        Errors,
        Context
      >;
    };

    // Create the result function with pages and items methods attached
    const result = baseFn as typeof baseFn & {
      pages: typeof pagesFn;
      items: typeof itemsFn;
    };

    result.pages = pagesFn;
    result.items = itemsFn;

    return result;
  },
};
