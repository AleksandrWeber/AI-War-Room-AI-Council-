import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRecoveryizabilityRolloutGuidance,
  recoveryizabilityAdminActionRequestSchema,
  recoveryizabilityAdminActionResponseSchema,
  recoveryizabilityAdminSummaryResponseSchema,
  recoveryizabilityCapabilitiesResponseSchema,
  recoveryizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRecoveryizabilityAdminRecords,
  buildRecoveryizabilityAdminStats,
  getRecoveryizabilityAdminGuidance,
  resolveRecoveryizabilityAdminActions,
} from './recoveryizability-admin.helpers.js'
import { evaluateRecoveryizabilityRollout } from './recoveryizability-rollout.helpers.js'
import { RecoveryizabilityStatusService } from './recoveryizability-status.service.js'

@Injectable()
export class RecoveryizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly recoveryizabilityStatusService: RecoveryizabilityStatusService,
  ) {}

  getCapabilities() {
    return recoveryizabilityCapabilitiesResponseSchema.parse({
      supportsRecoveryizabilityRollout: true,
      supportsRecoveryizabilityAdminTools: true,
      supportsBillingNotificationRecoveryizabilitySignals: true,
      supportsBillingWebhookRecoveryizabilitySignals: true,
      guidance: getRecoveryizabilityRolloutGuidance(),
    })
  }

  async getRecoveryizabilityRollout() {
    const recoveryizabilityTableCoverage =
      await this.recoveryizabilityStatusService.getRecoveryizabilityTableCoverage()

    const rollout = evaluateRecoveryizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.recoveryizabilityStatusService.pingPostgres(),
      existingRecoveryizabilityTableCount: recoveryizabilityTableCoverage.existingRecoveryizabilityTableCount,
      billingNotificationsTableExists: recoveryizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: recoveryizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: recoveryizabilityTableCoverage.usageEventsTableExists,
    })

    return recoveryizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRecoveryizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRecoveryizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.recoveryizabilityStatusService.getWorkspaceRecoveryizabilityInventory(
        workspaceId,
      )
    const records = buildRecoveryizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.recoveryizabilityStatusService.pingPostgres()
    const stats = buildRecoveryizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return recoveryizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRecoveryizabilityAdminActions(),
      guidance: getRecoveryizabilityAdminGuidance({ stats }),
    })
  }

  async executeRecoveryizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_recoveryizability_summary'
    },
  ) {
    this.assertCanManageRecoveryizability(authContext)

    const payload = recoveryizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_recoveryizability_summary': {
        const summary = await this.getWorkspaceRecoveryizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return recoveryizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed recoveryizability summary with ${summary.stats.recoveryizabilityPercent}% billing notification recoveryizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRecoveryizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production recoveryizability tools.',
    })
  }
}
