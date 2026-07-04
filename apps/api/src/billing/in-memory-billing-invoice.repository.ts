import type { BillingInvoiceRecord } from '@ai-war-room/schemas'
import type {
  BillingInvoiceRepository,
  UpsertBillingInvoiceInput,
} from './billing-invoice.repository.js'

export class InMemoryBillingInvoiceRepository
  implements BillingInvoiceRepository
{
  private readonly invoices = new Map<string, BillingInvoiceRecord>()

  async upsertInvoice(input: UpsertBillingInvoiceInput) {
    const now = new Date().toISOString()
    const existing = this.invoices.get(input.externalInvoiceId)
    const record: BillingInvoiceRecord = {
      billingInvoiceId: existing?.billingInvoiceId ?? `binv_${input.externalInvoiceId}`,
      workspaceId: input.workspaceId,
      provider: input.provider,
      externalInvoiceId: input.externalInvoiceId,
      externalCustomerId: input.externalCustomerId ?? null,
      paidTier: input.paidTier ?? null,
      amountTotalUsd: input.amountTotalUsd,
      currency: input.currency,
      status: input.status,
      hostedInvoiceUrl: input.hostedInvoiceUrl ?? null,
      invoicePdfUrl: input.invoicePdfUrl ?? null,
      periodStart: input.periodStart ?? null,
      periodEnd: input.periodEnd ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    this.invoices.set(input.externalInvoiceId, record)

    return record
  }

  async listWorkspaceInvoices(workspaceId: string, limit = 20) {
    return [...this.invoices.values()]
      .filter((invoice) => invoice.workspaceId === workspaceId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit)
  }
}
