import { randomUUID } from 'node:crypto'
import type { BillingMeterUsageReport } from '@ai-war-room/schemas'
import type {
  BillingMeterUsageRepository,
  CreateBillingMeterUsageReportInput,
} from './billing-meter-usage.repository.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

export class InMemoryBillingMeterUsageRepository
  implements BillingMeterUsageRepository
{
  private readonly reports: BillingMeterUsageReport[] = []

  async createReport(
    input: CreateBillingMeterUsageReportInput,
  ): Promise<BillingMeterUsageReport> {
    const createdAt = new Date().toISOString()
    const report: BillingMeterUsageReport = {
      billingMeterUsageReportId: createId('bmur'),
      workspaceId: input.workspaceId,
      provider: input.provider,
      externalSubscriptionItemId: input.externalSubscriptionItemId ?? null,
      externalUsageRecordId: input.externalUsageRecordId ?? null,
      metric: input.metric,
      quantity: input.quantity,
      status: input.status,
      errorMessage: input.errorMessage ?? null,
      runId: input.runId ?? null,
      createdAt,
    }

    this.reports.unshift(report)

    return report
  }

  async listWorkspaceReports(workspaceId: string, limit = 20) {
    return this.reports
      .filter((report) => report.workspaceId === workspaceId)
      .slice(0, limit)
  }
}
