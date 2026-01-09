import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const GetInvoiceLineItemsInput = Schema.Struct({
  organization: Schema.String,
  id: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; id: string }) => `/organizations/${input.organization}/invoices/${input.id}/line-items`,
});
export type GetInvoiceLineItemsInput = typeof GetInvoiceLineItemsInput.Type;

// Output Schema
export const GetInvoiceLineItemsOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.Number,
  next_page_url: Schema.String,
  prev_page: Schema.Number,
  prev_page_url: Schema.String,
  data: Schema.Array(Schema.Struct({
    id: Schema.String,
    subtotal: Schema.Number,
    description: Schema.String,
    metric_name: Schema.String,
    database_id: Schema.String,
    database_name: Schema.String,
    resource: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
      deleted_at: Schema.String,
    }),
  })),
});
export type GetInvoiceLineItemsOutput = typeof GetInvoiceLineItemsOutput.Type;

// Error Schemas
export class GetInvoiceLineItemsUnauthorized extends Schema.TaggedError<GetInvoiceLineItemsUnauthorized>()(
  "GetInvoiceLineItemsUnauthorized",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetInvoiceLineItemsForbidden extends Schema.TaggedError<GetInvoiceLineItemsForbidden>()(
  "GetInvoiceLineItemsForbidden",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetInvoiceLineItemsNotfound extends Schema.TaggedError<GetInvoiceLineItemsNotfound>()(
  "GetInvoiceLineItemsNotfound",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const getInvoiceLineItems = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetInvoiceLineItemsInput,
  outputSchema: GetInvoiceLineItemsOutput,
  errors: [GetInvoiceLineItemsUnauthorized, GetInvoiceLineItemsForbidden, GetInvoiceLineItemsNotfound],
}));
