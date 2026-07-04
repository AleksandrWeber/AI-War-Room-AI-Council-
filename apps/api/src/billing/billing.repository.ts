import type {
  BillingRecord,
  BillingStatus,
  CheckoutPaidTier,
} from '@ai-war-room/schemas'

export const BILLING_REPOSITORY = Symbol('BILLING_REPOSITORY')

export interface BillingRepository {
  getBillingRecord(workspaceId: string): Promise<BillingRecord | null>
  getBillingRecordByExternalCustomerId(
    externalCustomerId: string,
  ): Promise<BillingRecord | null>
  activateSubscription(input: {
    workspaceId: string
    paidTier: CheckoutPaidTier
    externalCustomerId?: string
    externalSubscriptionItemId?: string
  }): Promise<BillingRecord>
  updateBillingStatus(input: {
    workspaceId: string
    status: BillingStatus
    paidTier?: CheckoutPaidTier | 'free'
  }): Promise<BillingRecord | null>
  resetMockWorkspaceBilling(workspaceId: string): Promise<BillingRecord | null>
}
