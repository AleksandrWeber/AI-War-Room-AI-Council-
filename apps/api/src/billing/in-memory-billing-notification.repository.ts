import { randomUUID } from 'node:crypto'
import type { BillingNotificationRecord } from '@ai-war-room/schemas'
import type {
  BillingNotificationRepository,
  CreateBillingNotificationInput,
} from './billing-notification.repository.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

export class InMemoryBillingNotificationRepository
  implements BillingNotificationRepository
{
  private readonly notifications: BillingNotificationRecord[] = []

  async findByAlertId(workspaceId: string, alertId: string) {
    return (
      this.notifications.find(
        (notification) =>
          notification.workspaceId === workspaceId &&
          notification.alertId === alertId,
      ) ?? null
    )
  }

  async createNotification(input: CreateBillingNotificationInput) {
    const notification: BillingNotificationRecord = {
      billingNotificationId: createId('bnotif'),
      workspaceId: input.workspaceId,
      alertId: input.alertId,
      alertType: input.alertType,
      severity: input.severity,
      message: input.message,
      channel: input.channel,
      status: 'pending',
      deliveryReference: null,
      errorMessage: null,
      deliveredAt: null,
      createdAt: new Date().toISOString(),
    }

    this.notifications.unshift(notification)

    return notification
  }

  async finalizeNotification(input: {
    billingNotificationId: string
    status: 'delivered' | 'failed'
    deliveryReference?: string | null
    errorMessage?: string | null
    deliveredAt?: string
  }) {
    const notification = this.notifications.find(
      (entry) => entry.billingNotificationId === input.billingNotificationId,
    )

    if (!notification) {
      throw new Error('Billing notification was not found.')
    }

    notification.status = input.status
    notification.deliveryReference = input.deliveryReference ?? null
    notification.errorMessage = input.errorMessage ?? null
    notification.deliveredAt =
      input.deliveredAt ??
      (input.status === 'delivered' ? new Date().toISOString() : null)

    return notification
  }

  async listWorkspaceNotifications(workspaceId: string, limit = 20) {
    return this.notifications
      .filter((notification) => notification.workspaceId === workspaceId)
      .slice(0, limit)
  }
}
