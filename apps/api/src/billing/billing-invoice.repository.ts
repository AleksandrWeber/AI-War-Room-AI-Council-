import type {
  BillingAdapter,
  BillingInvoiceRecord,
  BillingInvoiceStatus,
  PaidTier,
} from '@ai-war-room/schemas'

export const BILLING_INVOICE_REPOSITORY = Symbol('BILLING_INVOICE_REPOSITORY')

export type UpsertBillingInvoiceInput = {
  workspaceId: string
  provider: BillingAdapter
  externalInvoiceId: string
  externalCustomerId?: string | null
  paidTier?: PaidTier | null
  amountTotalUsd: number
  currency: string
  status: BillingInvoiceStatus
  hostedInvoiceUrl?: string | null
  invoicePdfUrl?: string | null
  periodStart?: string | null
  periodEnd?: string | null
}

export interface BillingInvoiceRepository {
  upsertInvoice(input: UpsertBillingInvoiceInput): Promise<BillingInvoiceRecord>
  listWorkspaceInvoices(
    workspaceId: string,
    limit?: number,
  ): Promise<BillingInvoiceRecord[]>
}
