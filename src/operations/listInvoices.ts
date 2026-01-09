import { Schema } from "effect";
import { API, ApiErrorCode, ApiMethod, ApiPath } from "../client";

// Input Schema
export const ListInvoicesInput = Schema.Struct({
  organization: Schema.String,
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string }) => `/organizations/${input.organization}/invoices`,
});
export type ListInvoicesInput = typeof ListInvoicesInput.Type;

// Output Schema
export const ListInvoicesOutput = Schema.Struct({
  current_page: Schema.Number,
  next_page: Schema.Number,
  next_page_url: Schema.String,
  prev_page: Schema.Number,
  prev_page_url: Schema.String,
  data: Schema.Array(Schema.Struct({
    id: Schema.String,
    total: Schema.Number,
    billing_period_start: Schema.String,
    billing_period_end: Schema.String,
  })),
});
export type ListInvoicesOutput = typeof ListInvoicesOutput.Type;

// Error Schemas
export class ListInvoicesUnauthorized extends Schema.TaggedError<ListInvoicesUnauthorized>()(
  "ListInvoicesUnauthorized",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class ListInvoicesForbidden extends Schema.TaggedError<ListInvoicesForbidden>()(
  "ListInvoicesForbidden",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class ListInvoicesNotfound extends Schema.TaggedError<ListInvoicesNotfound>()(
  "ListInvoicesNotfound",
  {
    organization: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
export const listInvoices = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListInvoicesInput,
  outputSchema: ListInvoicesOutput,
  errors: [ListInvoicesUnauthorized, ListInvoicesForbidden, ListInvoicesNotfound],
}));
