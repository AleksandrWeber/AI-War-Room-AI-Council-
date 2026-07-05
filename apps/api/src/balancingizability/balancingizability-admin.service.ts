import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBalancingizabilityRolloutGuidance,
  balancingizabilityAdminActionRequestSchema,
  balancingizabilityAdminActionResponseSchema,
  balancingizabilityAdminSummaryResponseSchema,
  balancingizabilityCapabilitiesResponseSchema,
  balancingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBalancingizabilityAdminRecords,
  buildBalancingizabilityAdminStats,
  getBalancingizabilityAdminGuidance,
  resolveBalancingizabilityAdminActions,
} from './balancingizability-admin.helpers.js'
import { evaluateBalancingizabilityRollout } from './balancingizability-rollout.helpers.js'
import { BalancingizabilityStatusService } from './balancingizability-status.service.js'

@Injectable()
export class BalancingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly balancingizabilityStatusService: BalancingizabilityStatusService,
  ) {}

  getCapabilities() {
    return balancingizabilityCapabilitiesResponseSchema.parse({
      supportsBalancingizabilityRollout: true,
      supportsBalancingizabilityAdminTools: true,
      supportsModelHealthBalancingizabilitySignals: true,
      supportsModelRegistryBalancingizabilitySignals: true,
      guidance: getBalancingizabilityRolloutGuidance(),
    })
  }

  async getBalancingizabilityRollout() {
    const balancingizabilityTableCoverage =
      await this.balancingizabilityStatusService.getBalancingizabilityTableCoverage()

    const rollout = evaluateBalancingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.balancingizabilityStatusService.pingPostgres(),
      existingBalancingizabilityTableCount: balancingizabilityTableCoverage.existingBalancingizabilityTableCount,
      modelHealthEventsTableExists: balancingizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: balancingizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: balancingizabilityTableCoverage.billingRecordsTableExists,
    })

    return balancingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBalancingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBalancingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.balancingizabilityStatusService.getWorkspaceBalancingizabilityInventory(
        workspaceId,
      )
    const records = buildBalancingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.balancingizabilityStatusService.pingPostgres()
    const stats = buildBalancingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return balancingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBalancingizabilityAdminActions(),
      guidance: getBalancingizabilityAdminGuidance({ stats }),
    })
  }

  async executeBalancingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_balancingizability_summary'
    },
  ) {
    this.assertCanManageBalancingizability(authContext)

    const payload = balancingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_balancingizability_summary': {
        const summary = await this.getWorkspaceBalancingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return balancingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed balancingizability summary with ${summary.stats.balancingizabilityPercent}% model health balancingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBalancingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production balancingizability tools.',
    })
  }
}
