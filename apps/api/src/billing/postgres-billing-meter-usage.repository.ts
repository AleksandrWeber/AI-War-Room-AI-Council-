import { Injectable } from '@nestjs/common'
import type { BillingMeterUsageReport } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import type {
  BillingMeterUsageRepository,
  CreateBillingMeterUsageReportInput,
} from './billing-meter-usage.repository.js'

type BillingMeterUsageReportRow = {
  billing_meter_usage_report_id: string
  workspace_id: string
  provider: BillingMeterUsageReport['provider']
  external_subscription_item_id: string | null
  external_usage_record_id: string | null
  metric: BillingMeterUsageReport['metric']
  quantity: number
  status: BillingMeterUsageReport['status']
  error_message: string | null
  run_id: string | null
  created_at: Date
}

@Injectable()
export class PostgresBillingMeterUsageRepository
  implements BillingMeterUsageRepository
{
  constructor(private readonly postgresService: PostgresService) {}

  async createReport(
    input: CreateBillingMeterUsageReportInput,
  ): Promise<BillingMeterUsageReport> {
    const billingMeterUsageReportId = `bmur_${crypto.randomUUID()}`
    const result = await this.postgresService.query<BillingMeterUsageReportRow>(
      `
        INSERT INTO billing_meter_usage_reports (
          billing_meter_usage_report_id,
          workspace_id,
          provider,
          external_subscription_item_id,
          external_usage_record_id,
          metric,
          quantity,
          status,
          error_message,
          run_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING
          billing_meter_usage_report_id,
          workspace_id,
          provider,
          external_subscription_item_id,
          external_usage_record_id,
          metric,
          quantity,
          status,
          error_message,
          run_id,
          created_at
      `,
      [
        billingMeterUsageReportId,
        input.workspaceId,
        input.provider,
        input.externalSubscriptionItemId ?? null,
        input.externalUsageRecordId ?? null,
        input.metric,
        input.quantity,
        input.status,
        input.errorMessage ?? null,
        input.runId ?? null,
      ],
    )
    const row = result.rows[0]

    if (!row) {
      throw new Error('Failed to create billing meter usage report.')
    }

    return this.mapRow(row)
  }

  async listWorkspaceReports(workspaceId: string, limit = 20) {
    const result = await this.postgresService.query<BillingMeterUsageReportRow>(
      `
        SELECT
          billing_meter_usage_report_id,
          workspace_id,
          provider,
          external_subscription_item_id,
          external_usage_record_id,
          metric,
          quantity,
          status,
          error_message,
          run_id,
          created_at
        FROM billing_meter_usage_reports
        WHERE workspace_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [workspaceId, limit],
    )

    return result.rows.map((row) => this.mapRow(row))
  }

  private mapRow(row: BillingMeterUsageReportRow): BillingMeterUsageReport {
    return {
      billingMeterUsageReportId: row.billing_meter_usage_report_id,
      workspaceId: row.workspace_id,
      provider: row.provider,
      externalSubscriptionItemId: row.external_subscription_item_id,
      externalUsageRecordId: row.external_usage_record_id,
      metric: row.metric,
      quantity: row.quantity,
      status: row.status,
      errorMessage: row.error_message,
      runId: row.run_id,
      createdAt: row.created_at.toISOString(),
    }
  }
}
