import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNoticeabilityRolloutGuidance,
  noticeabilityAdminActionRequestSchema,
  noticeabilityAdminActionResponseSchema,
  noticeabilityAdminSummaryResponseSchema,
  noticeabilityCapabilitiesResponseSchema,
  noticeabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNoticeabilityAdminRecords,
  buildNoticeabilityAdminStats,
  getNoticeabilityAdminGuidance,
  resolveNoticeabilityAdminActions,
} from './noticeability-admin.helpers.js'
import { evaluateNoticeabilityRollout } from './noticeability-rollout.helpers.js'
import { NoticeabilityStatusService } from './noticeability-status.service.js'

@Injectable()
export class NoticeabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly noticeabilityStatusService: NoticeabilityStatusService,
  ) {}

  getCapabilities() {
    return noticeabilityCapabilitiesResponseSchema.parse({
      supportsNoticeabilityRollout: true,
      supportsNoticeabilityAdminTools: true,
      supportsBillingNotificationNoticeabilitySignals: true,
      supportsBillingWebhookNoticeabilitySignals: true,
      guidance: getNoticeabilityRolloutGuidance(),
    })
  }

  async getNoticeabilityRollout() {
    const noticeabilityTableCoverage =
      await this.noticeabilityStatusService.getNoticeabilityTableCoverage()

    const rollout = evaluateNoticeabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.noticeabilityStatusService.pingPostgres(),
      existingNoticeabilityTableCount: noticeabilityTableCoverage.existingNoticeabilityTableCount,
      billingNotificationsTableExists: noticeabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: noticeabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: noticeabilityTableCoverage.usageEventsTableExists,
    })

    return noticeabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNoticeabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNoticeability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.noticeabilityStatusService.getWorkspaceNoticeabilityInventory(
        workspaceId,
      )
    const records = buildNoticeabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.noticeabilityStatusService.pingPostgres()
    const stats = buildNoticeabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return noticeabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNoticeabilityAdminActions(),
      guidance: getNoticeabilityAdminGuidance({ stats }),
    })
  }

  async executeNoticeabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_noticeability_summary'
    },
  ) {
    this.assertCanManageNoticeability(authContext)

    const payload = noticeabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_noticeability_summary': {
        const summary = await this.getWorkspaceNoticeabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return noticeabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed noticeability summary with ${summary.stats.noticeabilityPercent}% billing notification noticeability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNoticeability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production noticeability tools.',
    })
  }
}
