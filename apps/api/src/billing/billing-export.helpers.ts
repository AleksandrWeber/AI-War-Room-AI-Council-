import type { BillingExportFormat, BillingInvoiceRecord } from '@ai-war-room/schemas'

const CSV_HEADERS = [
  'billingInvoiceId',
  'externalInvoiceId',
  'workspaceId',
  'provider',
  'paidTier',
  'amountTotalUsd',
  'currency',
  'status',
  'hostedInvoiceUrl',
  'invoicePdfUrl',
  'periodStart',
  'periodEnd',
  'createdAt',
  'updatedAt',
] as const

function escapeCsvCell(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

function invoiceToCsvRow(invoice: BillingInvoiceRecord) {
  return [
    invoice.billingInvoiceId,
    invoice.externalInvoiceId,
    invoice.workspaceId,
    invoice.provider,
    invoice.paidTier,
    invoice.amountTotalUsd,
    invoice.currency,
    invoice.status,
    invoice.hostedInvoiceUrl,
    invoice.invoicePdfUrl,
    invoice.periodStart,
    invoice.periodEnd,
    invoice.createdAt,
    invoice.updatedAt,
  ]
    .map(escapeCsvCell)
    .join(',')
}

export function serializeBillingInvoicesCsv(invoices: BillingInvoiceRecord[]) {
  return [CSV_HEADERS.join(','), ...invoices.map(invoiceToCsvRow)].join('\n')
}

export function buildBillingInvoiceExportFilename(
  workspaceId: string,
  format: BillingExportFormat,
) {
  const date = new Date().toISOString().slice(0, 10)

  return `${workspaceId}-invoices-${date}.${format}`
}
