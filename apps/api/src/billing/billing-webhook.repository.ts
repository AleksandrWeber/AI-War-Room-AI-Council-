import type {
  BillingAdapter,
  BillingWebhookEventRecord,
  BillingWebhookEventStatus,
} from '@ai-war-room/schemas'

export const BILLING_WEBHOOK_REPOSITORY = Symbol('BILLING_WEBHOOK_REPOSITORY')

export interface BillingWebhookRepository {
  reserveWebhookEvent(input: {
    externalEventId: string
    provider: BillingAdapter
    eventType: string
    workspaceId?: string | null
  }): Promise<{
    inserted: boolean
    record: BillingWebhookEventRecord
  }>
  finalizeWebhookEvent(input: {
    billingWebhookEventId: string
    status: BillingWebhookEventStatus
    workspaceId?: string | null
    errorMessage?: string | null
  }): Promise<BillingWebhookEventRecord>
  listWorkspaceWebhookEvents(
    workspaceId: string,
    limit?: number,
  ): Promise<BillingWebhookEventRecord[]>
}
