import type {
  BillingAdapter,
  BillingWebhookEventRecord,
  BillingWebhookEventStatus,
} from '@ai-war-room/schemas'
import type { BillingWebhookRepository } from './billing-webhook.repository.js'

export class InMemoryBillingWebhookRepository
  implements BillingWebhookRepository
{
  private readonly events = new Map<string, BillingWebhookEventRecord>()

  async reserveWebhookEvent(input: {
    externalEventId: string
    provider: BillingAdapter
    eventType: string
    workspaceId?: string | null
  }) {
    const existing = this.events.get(input.externalEventId)

    if (existing) {
      return {
        inserted: false,
        record: {
          ...existing,
          status: 'duplicate' as const,
        },
      }
    }

    const now = new Date().toISOString()
    const record: BillingWebhookEventRecord = {
      billingWebhookEventId: `bwe_${input.externalEventId}`,
      provider: input.provider,
      externalEventId: input.externalEventId,
      eventType: input.eventType,
      workspaceId: input.workspaceId ?? null,
      status: 'received',
      errorMessage: null,
      receivedAt: now,
      processedAt: null,
    }

    this.events.set(input.externalEventId, record)

    return {
      inserted: true,
      record,
    }
  }

  async finalizeWebhookEvent(input: {
    billingWebhookEventId: string
    status: BillingWebhookEventStatus
    workspaceId?: string | null
    errorMessage?: string | null
  }) {
    const record = [...this.events.values()].find(
      (event) => event.billingWebhookEventId === input.billingWebhookEventId,
    )

    if (!record) {
      throw new Error(`Webhook event ${input.billingWebhookEventId} was not found.`)
    }

    const updated: BillingWebhookEventRecord = {
      ...record,
      status: input.status,
      workspaceId: input.workspaceId ?? record.workspaceId,
      errorMessage: input.errorMessage ?? null,
      processedAt: new Date().toISOString(),
    }

    this.events.set(record.externalEventId, updated)

    return updated
  }

  async listWorkspaceWebhookEvents(workspaceId: string, limit = 20) {
    return [...this.events.values()]
      .filter((event) => event.workspaceId === workspaceId)
      .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt))
      .slice(0, limit)
  }
}
