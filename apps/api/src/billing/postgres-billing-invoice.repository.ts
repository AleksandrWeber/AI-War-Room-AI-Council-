import { Injectable } from '@nestjs/common'
import type { BillingInvoiceRecord } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import type {
  BillingInvoiceRepository,
  UpsertBillingInvoiceInput,
} from './billing-invoice.repository.js'

type BillingInvoiceRow = {
  billing_invoice_id: string
  workspace_id: string
  provider: BillingInvoiceRecord['provider']
  external_invoice_id: string
  external_customer_id: string | null
  paid_tier: BillingInvoiceRecord['paidTier']
  amount_total_usd: string
  currency: string
  status: BillingInvoiceRecord['status']
  hosted_invoice_url: string | null
  invoice_pdf_url: string | null
  period_start: Date | null
  period_end: Date | null
  created_at: Date
  updated_at: Date
}

@Injectable()
export class PostgresBillingInvoiceRepository
  implements BillingInvoiceRepository
{
  constructor(private readonly postgresService: PostgresService) {}

  async upsertInvoice(input: UpsertBillingInvoiceInput) {
    const billingInvoiceId = `binv_${input.externalInvoiceId}`

    const result = await this.postgresService.query<BillingInvoiceRow>(
      `
        INSERT INTO billing_invoices (
          billing_invoice_id,
          workspace_id,
          provider,
          external_invoice_id,
          external_customer_id,
          paid_tier,
          amount_total_usd,
          currency,
          status,
          hosted_invoice_url,
          invoice_pdf_url,
          period_start,
          period_end
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (external_invoice_id) DO UPDATE
        SET workspace_id = EXCLUDED.workspace_id,
            external_customer_id = EXCLUDED.external_customer_id,
            paid_tier = EXCLUDED.paid_tier,
            amount_total_usd = EXCLUDED.amount_total_usd,
            currency = EXCLUDED.currency,
            status = EXCLUDED.status,
            hosted_invoice_url = EXCLUDED.hosted_invoice_url,
            invoice_pdf_url = EXCLUDED.invoice_pdf_url,
            period_start = EXCLUDED.period_start,
            period_end = EXCLUDED.period_end,
            updated_at = NOW()
        RETURNING
          billing_invoice_id,
          workspace_id,
          provider,
          external_invoice_id,
          external_customer_id,
          paid_tier,
          amount_total_usd,
          currency,
          status,
          hosted_invoice_url,
          invoice_pdf_url,
          period_start,
          period_end,
          created_at,
          updated_at
      `,
      [
        billingInvoiceId,
        input.workspaceId,
        input.provider,
        input.externalInvoiceId,
        input.externalCustomerId ?? null,
        input.paidTier ?? null,
        input.amountTotalUsd,
        input.currency,
        input.status,
        input.hostedInvoiceUrl ?? null,
        input.invoicePdfUrl ?? null,
        input.periodStart ?? null,
        input.periodEnd ?? null,
      ],
    )
    const row = result.rows[0]

    if (!row) {
      throw new Error(`Invoice ${input.externalInvoiceId} could not be upserted.`)
    }

    return this.mapRow(row)
  }

  async listWorkspaceInvoices(workspaceId: string, limit = 20) {
    const result = await this.postgresService.query<BillingInvoiceRow>(
      `
        SELECT
          billing_invoice_id,
          workspace_id,
          provider,
          external_invoice_id,
          external_customer_id,
          paid_tier,
          amount_total_usd,
          currency,
          status,
          hosted_invoice_url,
          invoice_pdf_url,
          period_start,
          period_end,
          created_at,
          updated_at
        FROM billing_invoices
        WHERE workspace_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [workspaceId, limit],
    )

    return result.rows.map((row) => this.mapRow(row))
  }

  private mapRow(row: BillingInvoiceRow): BillingInvoiceRecord {
    return {
      billingInvoiceId: row.billing_invoice_id,
      workspaceId: row.workspace_id,
      provider: row.provider,
      externalInvoiceId: row.external_invoice_id,
      externalCustomerId: row.external_customer_id,
      paidTier: row.paid_tier,
      amountTotalUsd: Number(row.amount_total_usd),
      currency: row.currency,
      status: row.status,
      hostedInvoiceUrl: row.hosted_invoice_url,
      invoicePdfUrl: row.invoice_pdf_url,
      periodStart: row.period_start?.toISOString() ?? null,
      periodEnd: row.period_end?.toISOString() ?? null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }
  }
}
