import * as Schema from "effect/Schema";
import { API, ApiErrorCode, ApiMethod, ApiPath, ApiPathParams } from "../client";

// Input Schema
export const GetInvoiceInput = Schema.Struct({
  organization: Schema.String,
  id: Schema.String,
}).annotations({
  [ApiMethod]: "GET",
  [ApiPath]: (input: { organization: string; id: string }) => `/organizations/${input.organization}/invoices/${input.id}`,
  [ApiPathParams]: ["organization", "id"] as const,
});
export type GetInvoiceInput = typeof GetInvoiceInput.Type;

// Output Schema
export const GetInvoiceOutput = Schema.Struct({
  id: Schema.String,
  total: Schema.String,
  billing_period_start: Schema.String,
  billing_period_end: Schema.String,
});
export type GetInvoiceOutput = typeof GetInvoiceOutput.Type;

// Error Schemas
export class GetInvoiceUnauthorized extends Schema.TaggedError<GetInvoiceUnauthorized>()(
  "GetInvoiceUnauthorized",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "unauthorized" },
) {}

export class GetInvoiceForbidden extends Schema.TaggedError<GetInvoiceForbidden>()(
  "GetInvoiceForbidden",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "forbidden" },
) {}

export class GetInvoiceNotfound extends Schema.TaggedError<GetInvoiceNotfound>()(
  "GetInvoiceNotfound",
  {
    organization: Schema.String,
    id: Schema.String,
    message: Schema.String,
  },
  { [ApiErrorCode]: "not_found" },
) {}

// The operation
/**
 * Get an invoice
 *
 * @param organization - The name of the organization
 * @param id - The ID of the invoice
 */
export const getInvoice = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: GetInvoiceInput,
  outputSchema: GetInvoiceOutput,
  errors: [GetInvoiceUnauthorized, GetInvoiceForbidden, GetInvoiceNotfound],
}));
