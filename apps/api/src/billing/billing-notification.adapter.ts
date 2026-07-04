import { randomUUID } from 'node:crypto'
import type { BillingAlertSeverity } from '@ai-war-room/schemas'

export const BILLING_NOTIFICATION_ADAPTER = Symbol(
  'BILLING_NOTIFICATION_ADAPTER',
)

export type BillingNotificationDeliveryInput = {
  workspaceId: string
  alertId: string
  severity: BillingAlertSeverity
  message: string
  recipient?: string
}

export type BillingNotificationDeliveryResult = {
  deliveryReference: string
}

export interface BillingNotificationAdapter {
  deliver(
    input: BillingNotificationDeliveryInput,
  ): Promise<BillingNotificationDeliveryResult>
}

export class MockBillingNotificationAdapter
  implements BillingNotificationAdapter
{
  async deliver(input: BillingNotificationDeliveryInput) {
    void input

    return {
      deliveryReference: `mock_notif_${randomUUID()}`,
    }
  }
}

export class EmailStubBillingNotificationAdapter
  implements BillingNotificationAdapter
{
  constructor(private readonly recipient: string) {}

  async deliver(input: BillingNotificationDeliveryInput) {
    if (!this.recipient) {
      throw new Error(
        'BILLING_NOTIFICATION_RECIPIENT is required for email notification delivery.',
      )
    }

    return {
      deliveryReference: `email_stub_${input.alertId}`,
    }
  }
}
