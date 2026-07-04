import { Injectable } from '@nestjs/common'
import type {
  BillingAdapter,
  BillingWebhookEventRecord,
  BillingWebhookEventStatus,
} from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import type { BillingWebhookRepository } from './billing-webhook.repository.js'

type BillingWebhookEventRow = {
  billing_webhook_event_id: string
  provider: BillingAdapter
  external_event_id: string
  event_type: string
  workspace_id: string | null
  status: BillingWebhookEventStatus
  error_message: string | null
  received_at: Date
  processed_at: Date | null
}

@Injectable()
export class PostgresBillingWebhookRepository
  implements BillingWebhookRepository
{
  constructor(private readonly postgresService: PostgresService) {}

  async reserveWebhookEvent(input: {
    externalEventId: string
    provider: BillingAdapter
    eventType: string
    workspaceId?: string | null
  }) {
    const billingWebhookEventId = `bwe_${input.externalEventId}`

    const inserted = await this.postgresService.query<BillingWebhookEventRow>(
      `
        INSERT INTO billing_webhook_events (
          billing_webhook_event_id,
          provider,
          external_event_id,
          event_type,
          workspace_id,
          status
        )
        VALUES ($1, $2, $3, $4, $5, 'received')
        ON CONFLICT (external_event_id) DO NOTHING
        RETURNING
          billing_webhook_event_id,
          provider,
          external_event_id,
          event_type,
          workspace_id,
          status,
          error_message,
          received_at,
          processed_at
      `,
      [
        billingWebhookEventId,
        input.provider,
        input.externalEventId,
        input.eventType,
        input.workspaceId ?? null,
      ],
    )

    if (inserted.rows[0]) {
      return {
        inserted: true,
        record: this.mapRow(inserted.rows[0]),
      }
    }

    const existing = await this.postgresService.query<BillingWebhookEventRow>(
      `
        SELECT
          billing_webhook_event_id,
          provider,
          external_event_id,
          event_type,
          workspace_id,
          status,
          error_message,
          received_at,
          processed_at
        FROM billing_webhook_events
        WHERE external_event_id = $1
        LIMIT 1
      `,
      [input.externalEventId],
    )
    const row = existing.rows[0]

    if (!row) {
      throw new Error(
        `Webhook event ${input.externalEventId} could not be reserved.`,
      )
    }

    return {
      inserted: false,
      record: this.mapRow(row),
    }
  }

  async finalizeWebhookEvent(input: {
    billingWebhookEventId: string
    status: BillingWebhookEventStatus
    workspaceId?: string | null
    errorMessage?: string | null
  }) {
    const result = await this.postgresService.query<BillingWebhookEventRow>(
      `
        UPDATE billing_webhook_events
        SET status = $2,
            workspace_id = COALESCE($3, workspace_id),
            error_message = $4,
            processed_at = NOW()
        WHERE billing_webhook_event_id = $1
        RETURNING
          billing_webhook_event_id,
          provider,
          external_event_id,
          event_type,
          workspace_id,
          status,
          error_message,
          received_at,
          processed_at
      `,
      [
        input.billingWebhookEventId,
        input.status,
        input.workspaceId ?? null,
        input.errorMessage ?? null,
      ],
    )
    const row = result.rows[0]

    if (!row) {
      throw new Error(`Webhook event ${input.billingWebhookEventId} was not found.`)
    }

    return this.mapRow(row)
  }

  async listWorkspaceWebhookEvents(workspaceId: string, limit = 20) {
    const result = await this.postgresService.query<BillingWebhookEventRow>(
      `
        SELECT
          billing_webhook_event_id,
          provider,
          external_event_id,
          event_type,
          workspace_id,
          status,
          error_message,
          received_at,
          processed_at
        FROM billing_webhook_events
        WHERE workspace_id = $1
        ORDER BY received_at DESC
        LIMIT $2
      `,
      [workspaceId, limit],
    )

    return result.rows.map((row) => this.mapRow(row))
  }

  private mapRow(row: BillingWebhookEventRow): BillingWebhookEventRecord {
    return {
      billingWebhookEventId: row.billing_webhook_event_id,
      provider: row.provider,
      externalEventId: row.external_event_id,
      eventType: row.event_type,
      workspaceId: row.workspace_id,
      status: row.status,
      errorMessage: row.error_message,
      receivedAt: row.received_at.toISOString(),
      processedAt: row.processed_at?.toISOString() ?? null,
    }
  }
}
