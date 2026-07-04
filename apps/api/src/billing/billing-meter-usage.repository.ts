import type {
  BillingAdapter,
  BillingMeterUsageReport,
  BillingMeterUsageReportStatus,
} from '@ai-war-room/schemas'

export const BILLING_METER_USAGE_REPOSITORY = Symbol(
  'BILLING_METER_USAGE_REPOSITORY',
)

export type CreateBillingMeterUsageReportInput = {
  workspaceId: string
  provider: BillingAdapter
  externalSubscriptionItemId?: string | null
  externalUsageRecordId?: string | null
  metric: 'tokens'
  quantity: number
  status: BillingMeterUsageReportStatus
  errorMessage?: string | null
  runId?: string | null
}

export interface BillingMeterUsageRepository {
  createReport(
    input: CreateBillingMeterUsageReportInput,
  ): Promise<BillingMeterUsageReport>
  listWorkspaceReports(
    workspaceId: string,
    limit?: number,
  ): Promise<BillingMeterUsageReport[]>
}
