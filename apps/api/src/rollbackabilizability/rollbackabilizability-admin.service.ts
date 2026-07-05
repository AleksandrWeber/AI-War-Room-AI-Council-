import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRollbackabilizabilityRolloutGuidance,
  rollbackabilizabilityAdminActionRequestSchema,
  rollbackabilizabilityAdminActionResponseSchema,
  rollbackabilizabilityAdminSummaryResponseSchema,
  rollbackabilizabilityCapabilitiesResponseSchema,
  rollbackabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRollbackabilizabilityAdminRecords,
  buildRollbackabilizabilityAdminStats,
  getRollbackabilizabilityAdminGuidance,
  resolveRollbackabilizabilityAdminActions,
} from './rollbackabilizability-admin.helpers.js'
import { evaluateRollbackabilizabilityRollout } from './rollbackabilizability-rollout.helpers.js'
import { RollbackabilizabilityStatusService } from './rollbackabilizability-status.service.js'

@Injectable()
export class RollbackabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly rollbackabilizabilityStatusService: RollbackabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return rollbackabilizabilityCapabilitiesResponseSchema.parse({
      supportsRollbackabilizabilityRollout: true,
      supportsRollbackabilizabilityAdminTools: true,
      supportsBillingWebhookRollbackabilizabilitySignals: true,
      supportsBillingRecordRollbackabilizabilitySignals: true,
      guidance: getRollbackabilizabilityRolloutGuidance(),
    })
  }

  async getRollbackabilizabilityRollout() {
    const rollbackabilizabilityTableCoverage =
      await this.rollbackabilizabilityStatusService.getRollbackabilizabilityTableCoverage()

    const rollout = evaluateRollbackabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.rollbackabilizabilityStatusService.pingPostgres(),
      existingRollbackabilizabilityTableCount: rollbackabilizabilityTableCoverage.existingRollbackabilizabilityTableCount,
      billingWebhookEventsTableExists: rollbackabilizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: rollbackabilizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: rollbackabilizabilityTableCoverage.usageEventsTableExists,
    })

    return rollbackabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRollbackabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRollbackabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.rollbackabilizabilityStatusService.getWorkspaceRollbackabilizabilityInventory(
        workspaceId,
      )
    const records = buildRollbackabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.rollbackabilizabilityStatusService.pingPostgres()
    const stats = buildRollbackabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return rollbackabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRollbackabilizabilityAdminActions(),
      guidance: getRollbackabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeRollbackabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_rollbackabilizability_summary'
    },
  ) {
    this.assertCanManageRollbackabilizability(authContext)

    const payload = rollbackabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_rollbackabilizability_summary': {
        const summary = await this.getWorkspaceRollbackabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return rollbackabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed rollbackabilizability summary with ${summary.stats.rollbackabilizabilityPercent}% billing webhook rollbackabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRollbackabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production rollbackabilizability tools.',
    })
  }
}
