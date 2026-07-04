import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  billingNotificationsResponseSchema,
  type BillingAlert,
  type BillingNotificationChannel,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { buildWorkspaceBillingAlerts } from './billing-alerts.helpers.js'
import {
  BILLING_NOTIFICATION_ADAPTER,
  type BillingNotificationAdapter,
} from './billing-notification.adapter.js'
import {
  BILLING_NOTIFICATION_REPOSITORY,
  type BillingNotificationRepository,
} from './billing-notification.repository.js'
import { BILLING_REPOSITORY, type BillingRepository } from './billing.repository.js'
import { UsageService } from '../usage/usage.service.js'

@Injectable()
export class BillingNotificationService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    @Inject(BILLING_REPOSITORY)
    private readonly billingRepository: BillingRepository,
    @Inject(BILLING_NOTIFICATION_REPOSITORY)
    private readonly billingNotificationRepository: BillingNotificationRepository,
    @Inject(BILLING_NOTIFICATION_ADAPTER)
    private readonly billingNotificationAdapter: BillingNotificationAdapter,
    private readonly usageService: UsageService,
  ) {}

  supportsBillingNotifications() {
    return this.configService.get('STRIPE_ENABLED', { infer: true })
  }

  private getNotificationChannel(): BillingNotificationChannel {
    return this.configService.get('BILLING_NOTIFICATION_ADAPTER', {
      infer: true,
    })
  }

  async syncWorkspaceNotifications(workspaceId: string) {
    if (!this.supportsBillingNotifications()) {
      return
    }

    const [usage, billingRecord] = await Promise.all([
      this.usageService.getWorkspaceUsageSummary(workspaceId),
      this.billingRepository.getBillingRecord(workspaceId),
    ])

    const alerts = buildWorkspaceBillingAlerts({
      workspaceId,
      usage,
      billingRecord,
    })

    for (const alert of alerts) {
      await this.deliverAlertNotification(workspaceId, alert)
    }
  }

  async listWorkspaceNotifications(workspaceId: string) {
    await this.syncWorkspaceNotifications(workspaceId)

    return this.getWorkspaceNotificationsSnapshot(workspaceId)
  }

  async getWorkspaceNotificationsSnapshot(workspaceId: string) {
    const notifications =
      await this.billingNotificationRepository.listWorkspaceNotifications(
        workspaceId,
      )

    return billingNotificationsResponseSchema.parse({
      workspaceId,
      notifications,
    })
  }

  private async deliverAlertNotification(
    workspaceId: string,
    alert: BillingAlert,
  ) {
    const existing = await this.billingNotificationRepository.findByAlertId(
      workspaceId,
      alert.billingAlertId,
    )

    if (existing?.status === 'delivered') {
      return existing
    }

    const channel = this.getNotificationChannel()
    const notification =
      existing ??
      (await this.billingNotificationRepository.createNotification({
        workspaceId,
        alertId: alert.billingAlertId,
        alertType: alert.type,
        severity: alert.severity,
        message: alert.message,
        channel,
      }))

    try {
      const delivery = await this.billingNotificationAdapter.deliver({
        workspaceId,
        alertId: alert.billingAlertId,
        severity: alert.severity,
        message: alert.message,
        recipient: this.configService.get('BILLING_NOTIFICATION_RECIPIENT', {
          infer: true,
        }),
      })

      return this.billingNotificationRepository.finalizeNotification({
        billingNotificationId: notification.billingNotificationId,
        status: 'delivered',
        deliveryReference: delivery.deliveryReference,
      })
    } catch (error) {
      return this.billingNotificationRepository.finalizeNotification({
        billingNotificationId: notification.billingNotificationId,
        status: 'failed',
        errorMessage:
          error instanceof Error
            ? error.message
            : 'Billing notification delivery failed.',
      })
    }
  }
}
