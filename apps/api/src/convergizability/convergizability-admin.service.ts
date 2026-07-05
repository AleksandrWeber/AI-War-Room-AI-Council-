import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConvergizabilityRolloutGuidance,
  convergizabilityAdminActionRequestSchema,
  convergizabilityAdminActionResponseSchema,
  convergizabilityAdminSummaryResponseSchema,
  convergizabilityCapabilitiesResponseSchema,
  convergizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConvergizabilityAdminRecords,
  buildConvergizabilityAdminStats,
  getConvergizabilityAdminGuidance,
  resolveConvergizabilityAdminActions,
} from './convergizability-admin.helpers.js'
import { evaluateConvergizabilityRollout } from './convergizability-rollout.helpers.js'
import { ConvergizabilityStatusService } from './convergizability-status.service.js'

@Injectable()
export class ConvergizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly convergizabilityStatusService: ConvergizabilityStatusService,
  ) {}

  getCapabilities() {
    return convergizabilityCapabilitiesResponseSchema.parse({
      supportsConvergizabilityRollout: true,
      supportsConvergizabilityAdminTools: true,
      supportsWorkspaceLimitConvergizabilitySignals: true,
      supportsUsageEventConvergizabilitySignals: true,
      guidance: getConvergizabilityRolloutGuidance(),
    })
  }

  async getConvergizabilityRollout() {
    const convergizabilityTableCoverage =
      await this.convergizabilityStatusService.getConvergizabilityTableCoverage()

    const rollout = evaluateConvergizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.convergizabilityStatusService.pingPostgres(),
      existingConvergizabilityTableCount: convergizabilityTableCoverage.existingConvergizabilityTableCount,
      workspaceUsageLimitsTableExists: convergizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: convergizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: convergizabilityTableCoverage.billingRecordsTableExists,
    })

    return convergizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConvergizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConvergizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.convergizabilityStatusService.getWorkspaceConvergizabilityInventory(
        workspaceId,
      )
    const records = buildConvergizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.convergizabilityStatusService.pingPostgres()
    const stats = buildConvergizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return convergizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConvergizabilityAdminActions(),
      guidance: getConvergizabilityAdminGuidance({ stats }),
    })
  }

  async executeConvergizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_convergizability_summary'
    },
  ) {
    this.assertCanManageConvergizability(authContext)

    const payload = convergizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_convergizability_summary': {
        const summary = await this.getWorkspaceConvergizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return convergizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed convergizability summary with ${summary.stats.convergizabilityPercent}% workspace limit convergizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConvergizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production convergizability tools.',
    })
  }
}
