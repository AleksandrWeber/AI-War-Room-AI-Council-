import { Injectable } from '@nestjs/common'
import type { BillingNotificationRecord } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import type {
  BillingNotificationRepository,
  CreateBillingNotificationInput,
} from './billing-notification.repository.js'

type BillingNotificationRow = {
  billing_notification_id: string
  workspace_id: string
  alert_id: string
  alert_type: BillingNotificationRecord['alertType']
  severity: BillingNotificationRecord['severity']
  message: string
  channel: BillingNotificationRecord['channel']
  status: BillingNotificationRecord['status']
  delivery_reference: string | null
  error_message: string | null
  delivered_at: Date | null
  created_at: Date
}

@Injectable()
export class PostgresBillingNotificationRepository
  implements BillingNotificationRepository
{
  constructor(private readonly postgresService: PostgresService) {}

  async findByAlertId(workspaceId: string, alertId: string) {
    const result = await this.postgresService.query<BillingNotificationRow>(
      `
        SELECT
          billing_notification_id,
          workspace_id,
          alert_id,
          alert_type,
          severity,
          message,
          channel,
          status,
          delivery_reference,
          error_message,
          delivered_at,
          created_at
        FROM billing_notifications
        WHERE workspace_id = $1
          AND alert_id = $2
        LIMIT 1
      `,
      [workspaceId, alertId],
    )

    const row = result.rows[0]

    return row ? this.mapRow(row) : null
  }

  async createNotification(input: CreateBillingNotificationInput) {
    const billingNotificationId = `bnotif_${crypto.randomUUID()}`
    const result = await this.postgresService.query<BillingNotificationRow>(
      `
        INSERT INTO billing_notifications (
          billing_notification_id,
          workspace_id,
          alert_id,
          alert_type,
          severity,
          message,
          channel,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
        RETURNING
          billing_notification_id,
          workspace_id,
          alert_id,
          alert_type,
          severity,
          message,
          channel,
          status,
          delivery_reference,
          error_message,
          delivered_at,
          created_at
      `,
      [
        billingNotificationId,
        input.workspaceId,
        input.alertId,
        input.alertType,
        input.severity,
        input.message,
        input.channel,
      ],
    )
    const row = result.rows[0]

    if (!row) {
      throw new Error('Failed to create billing notification.')
    }

    return this.mapRow(row)
  }

  async finalizeNotification(input: {
    billingNotificationId: string
    status: 'delivered' | 'failed'
    deliveryReference?: string | null
    errorMessage?: string | null
    deliveredAt?: string
  }) {
    const result = await this.postgresService.query<BillingNotificationRow>(
      `
        UPDATE billing_notifications
        SET status = $2,
            delivery_reference = $3,
            error_message = $4,
            delivered_at = COALESCE($5, CASE WHEN $2 = 'delivered' THEN NOW() ELSE delivered_at END)
        WHERE billing_notification_id = $1
        RETURNING
          billing_notification_id,
          workspace_id,
          alert_id,
          alert_type,
          severity,
          message,
          channel,
          status,
          delivery_reference,
          error_message,
          delivered_at,
          created_at
      `,
      [
        input.billingNotificationId,
        input.status,
        input.deliveryReference ?? null,
        input.errorMessage ?? null,
        input.deliveredAt ?? null,
      ],
    )
    const row = result.rows[0]

    if (!row) {
      throw new Error('Billing notification was not found.')
    }

    return this.mapRow(row)
  }

  async listWorkspaceNotifications(workspaceId: string, limit = 20) {
    const result = await this.postgresService.query<BillingNotificationRow>(
      `
        SELECT
          billing_notification_id,
          workspace_id,
          alert_id,
          alert_type,
          severity,
          message,
          channel,
          status,
          delivery_reference,
          error_message,
          delivered_at,
          created_at
        FROM billing_notifications
        WHERE workspace_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [workspaceId, limit],
    )

    return result.rows.map((row) => this.mapRow(row))
  }

  private mapRow(row: BillingNotificationRow): BillingNotificationRecord {
    return {
      billingNotificationId: row.billing_notification_id,
      workspaceId: row.workspace_id,
      alertId: row.alert_id,
      alertType: row.alert_type,
      severity: row.severity,
      message: row.message,
      channel: row.channel,
      status: row.status,
      deliveryReference: row.delivery_reference,
      errorMessage: row.error_message,
      deliveredAt: row.delivered_at?.toISOString() ?? null,
      createdAt: row.created_at.toISOString(),
    }
  }
}
