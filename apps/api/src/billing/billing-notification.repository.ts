import type {
  BillingAlertSeverity,
  BillingAlertType,
  BillingNotificationChannel,
  BillingNotificationRecord,
  BillingNotificationStatus,
} from '@ai-war-room/schemas'

export const BILLING_NOTIFICATION_REPOSITORY = Symbol(
  'BILLING_NOTIFICATION_REPOSITORY',
)

export type CreateBillingNotificationInput = {
  workspaceId: string
  alertId: string
  alertType: BillingAlertType
  severity: BillingAlertSeverity
  message: string
  channel: BillingNotificationChannel
}

export interface BillingNotificationRepository {
  findByAlertId(
    workspaceId: string,
    alertId: string,
  ): Promise<BillingNotificationRecord | null>
  createNotification(
    input: CreateBillingNotificationInput,
  ): Promise<BillingNotificationRecord>
  finalizeNotification(input: {
    billingNotificationId: string
    status: Exclude<BillingNotificationStatus, 'pending'>
    deliveryReference?: string | null
    errorMessage?: string | null
    deliveredAt?: string
  }): Promise<BillingNotificationRecord>
  listWorkspaceNotifications(
    workspaceId: string,
    limit?: number,
  ): Promise<BillingNotificationRecord[]>
}
