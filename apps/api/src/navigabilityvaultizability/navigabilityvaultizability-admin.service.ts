import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNavigabilityvaultizabilityRolloutGuidance,
  navigabilityvaultizabilityAdminActionRequestSchema,
  navigabilityvaultizabilityAdminActionResponseSchema,
  navigabilityvaultizabilityAdminSummaryResponseSchema,
  navigabilityvaultizabilityCapabilitiesResponseSchema,
  navigabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNavigabilityvaultizabilityAdminRecords,
  buildNavigabilityvaultizabilityAdminStats,
  getNavigabilityvaultizabilityAdminGuidance,
  resolveNavigabilityvaultizabilityAdminActions,
} from './navigabilityvaultizability-admin.helpers.js'
import { evaluateNavigabilityvaultizabilityRollout } from './navigabilityvaultizability-rollout.helpers.js'
import { NavigabilityvaultizabilityStatusService } from './navigabilityvaultizability-status.service.js'

@Injectable()
export class NavigabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly navigabilityvaultizabilityStatusService: NavigabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return navigabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsNavigabilityvaultizabilityRollout: true,
      supportsNavigabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationNavigabilityvaultizabilitySignals: true,
      supportsBillingWebhookNavigabilityvaultizabilitySignals: true,
      guidance: getNavigabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getNavigabilityvaultizabilityRollout() {
    const navigabilityvaultizabilityTableCoverage =
      await this.navigabilityvaultizabilityStatusService.getNavigabilityvaultizabilityTableCoverage()

    const rollout = evaluateNavigabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.navigabilityvaultizabilityStatusService.pingPostgres(),
      existingNavigabilityvaultizabilityTableCount: navigabilityvaultizabilityTableCoverage.existingNavigabilityvaultizabilityTableCount,
      billingNotificationsTableExists: navigabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: navigabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: navigabilityvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return navigabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNavigabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNavigabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.navigabilityvaultizabilityStatusService.getWorkspaceNavigabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildNavigabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.navigabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildNavigabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return navigabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNavigabilityvaultizabilityAdminActions(),
      guidance: getNavigabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeNavigabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_navigabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageNavigabilityvaultizability(authContext)

    const payload = navigabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_navigabilityvaultizability_summary': {
        const summary = await this.getWorkspaceNavigabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return navigabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed navigabilityvaultizability summary with ${summary.stats.navigabilityvaultizabilityPercent}% billing notification navigabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNavigabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production navigabilityvaultizability tools.',
    })
  }
}
