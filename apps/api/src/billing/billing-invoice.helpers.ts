import type {
  BillingAdapter,
  BillingInvoiceStatus,
  CheckoutPaidTier,
} from '@ai-war-room/schemas'
import { PAID_TIER_INVOICE_AMOUNTS_USD } from '@ai-war-room/schemas'
import type { UpsertBillingInvoiceInput } from './billing-invoice.repository.js'

export function buildPaidTierInvoiceInput(input: {
  workspaceId: string
  provider: BillingAdapter
  paidTier: CheckoutPaidTier
  externalInvoiceId: string
  externalCustomerId?: string | null
  status?: BillingInvoiceStatus
  hostedInvoiceUrl?: string | null
  invoicePdfUrl?: string | null
}): UpsertBillingInvoiceInput {
  return {
    workspaceId: input.workspaceId,
    provider: input.provider,
    externalInvoiceId: input.externalInvoiceId,
    externalCustomerId: input.externalCustomerId ?? null,
    paidTier: input.paidTier,
    amountTotalUsd: PAID_TIER_INVOICE_AMOUNTS_USD[input.paidTier],
    currency: 'usd',
    status: input.status ?? 'paid',
    hostedInvoiceUrl: input.hostedInvoiceUrl ?? null,
    invoicePdfUrl: input.invoicePdfUrl ?? null,
    periodStart: null,
    periodEnd: null,
  }
}
