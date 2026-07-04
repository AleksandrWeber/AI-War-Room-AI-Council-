import type {
  BillingRecord,
  BillingStatus,
  CheckoutPaidTier,
} from '@ai-war-room/schemas'
import type { BillingRepository } from './billing.repository.js'

const now = '2026-07-04T12:00:00.000Z'

function createSeedRecord(
  workspaceId: string,
  paidTier: BillingRecord['paidTier'] = 'free',
  status: BillingStatus = 'draft',
): BillingRecord {
  return {
    billingRecordId: `billing_${workspaceId}`,
    workspaceId,
    provider: 'stripe',
    externalCustomerId: null,
    externalSubscriptionItemId: null,
    paidTier,
    status,
    createdAt: now,
    updatedAt: now,
  }
}

export class InMemoryBillingRepository implements BillingRepository {
  private readonly records = new Map<string, BillingRecord>([
    ['workspace_1', createSeedRecord('workspace_1')],
    ['workspace_pro', createSeedRecord('workspace_pro', 'pro', 'active')],
  ])

  async getBillingRecord(workspaceId: string): Promise<BillingRecord | null> {
    return this.records.get(workspaceId) ?? null
  }

  async getBillingRecordByExternalCustomerId(
    externalCustomerId: string,
  ): Promise<BillingRecord | null> {
    return (
      [...this.records.values()].find(
        (record) => record.externalCustomerId === externalCustomerId,
      ) ?? null
    )
  }

  async activateSubscription(input: {
    workspaceId: string
    paidTier: CheckoutPaidTier
    externalCustomerId?: string
    externalSubscriptionItemId?: string
  }): Promise<BillingRecord> {
    const existing =
      this.records.get(input.workspaceId) ??
      createSeedRecord(input.workspaceId)
    const updatedAt = new Date().toISOString()
    const record: BillingRecord = {
      ...existing,
      paidTier: input.paidTier,
      status: 'active',
      externalCustomerId: input.externalCustomerId ?? existing.externalCustomerId,
      externalSubscriptionItemId:
        input.externalSubscriptionItemId ??
        existing.externalSubscriptionItemId ??
        `mock_sub_item_${input.workspaceId}`,
      updatedAt,
    }

    this.records.set(input.workspaceId, record)

    return record
  }

  async updateBillingStatus(input: {
    workspaceId: string
    status: BillingStatus
    paidTier?: CheckoutPaidTier | 'free'
  }): Promise<BillingRecord | null> {
    const existing = this.records.get(input.workspaceId)

    if (!existing) {
      return null
    }

    const updatedAt = new Date().toISOString()
    const record: BillingRecord = {
      ...existing,
      status: input.status,
      paidTier: input.paidTier ?? existing.paidTier,
      updatedAt,
    }

    this.records.set(input.workspaceId, record)

    return record
  }
}
