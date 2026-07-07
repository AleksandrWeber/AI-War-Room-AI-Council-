import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIntegrityizabilityRolloutGuidance,
  integrityizabilityAdminActionRequestSchema,
  integrityizabilityAdminActionResponseSchema,
  integrityizabilityAdminSummaryResponseSchema,
  integrityizabilityCapabilitiesResponseSchema,
  integrityizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIntegrityizabilityAdminRecords,
  buildIntegrityizabilityAdminStats,
  getIntegrityizabilityAdminGuidance,
  resolveIntegrityizabilityAdminActions,
} from './integrityizability-admin.helpers.js'
import { evaluateIntegrityizabilityRollout } from './integrityizability-rollout.helpers.js'
import { IntegrityizabilityStatusService } from './integrityizability-status.service.js'

@Injectable()
export class IntegrityizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly integrityizabilityStatusService: IntegrityizabilityStatusService,
  ) {}

  getCapabilities() {
    return integrityizabilityCapabilitiesResponseSchema.parse({
      supportsIntegrityizabilityRollout: true,
      supportsIntegrityizabilityAdminTools: true,
      supportsBillingNotificationIntegrityizabilitySignals: true,
      supportsBillingWebhookIntegrityizabilitySignals: true,
      guidance: getIntegrityizabilityRolloutGuidance(),
    })
  }

  async getIntegrityizabilityRollout() {
    const integrityizabilityTableCoverage =
      await this.integrityizabilityStatusService.getIntegrityizabilityTableCoverage()

    const rollout = evaluateIntegrityizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.integrityizabilityStatusService.pingPostgres(),
      existingIntegrityizabilityTableCount: integrityizabilityTableCoverage.existingIntegrityizabilityTableCount,
      billingNotificationsTableExists: integrityizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: integrityizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: integrityizabilityTableCoverage.usageEventsTableExists,
    })

    return integrityizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIntegrityizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIntegrityizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.integrityizabilityStatusService.getWorkspaceIntegrityizabilityInventory(
        workspaceId,
      )
    const records = buildIntegrityizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.integrityizabilityStatusService.pingPostgres()
    const stats = buildIntegrityizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return integrityizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIntegrityizabilityAdminActions(),
      guidance: getIntegrityizabilityAdminGuidance({ stats }),
    })
  }

  async executeIntegrityizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_integrityizability_summary'
    },
  ) {
    this.assertCanManageIntegrityizability(authContext)

    const payload = integrityizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_integrityizability_summary': {
        const summary = await this.getWorkspaceIntegrityizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return integrityizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed integrityizability summary with ${summary.stats.integrityizabilityPercent}% billing notification integrityizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIntegrityizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production integrityizability tools.',
    })
  }
}
