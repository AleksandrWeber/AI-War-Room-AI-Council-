import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMethodizabilityRolloutGuidance,
  methodizabilityAdminActionRequestSchema,
  methodizabilityAdminActionResponseSchema,
  methodizabilityAdminSummaryResponseSchema,
  methodizabilityCapabilitiesResponseSchema,
  methodizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMethodizabilityAdminRecords,
  buildMethodizabilityAdminStats,
  getMethodizabilityAdminGuidance,
  resolveMethodizabilityAdminActions,
} from './methodizability-admin.helpers.js'
import { evaluateMethodizabilityRollout } from './methodizability-rollout.helpers.js'
import { MethodizabilityStatusService } from './methodizability-status.service.js'

@Injectable()
export class MethodizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly methodizabilityStatusService: MethodizabilityStatusService,
  ) {}

  getCapabilities() {
    return methodizabilityCapabilitiesResponseSchema.parse({
      supportsMethodizabilityRollout: true,
      supportsMethodizabilityAdminTools: true,
      supportsWorkspaceLimitMethodizabilitySignals: true,
      supportsUsageEventMethodizabilitySignals: true,
      guidance: getMethodizabilityRolloutGuidance(),
    })
  }

  async getMethodizabilityRollout() {
    const methodizabilityTableCoverage =
      await this.methodizabilityStatusService.getMethodizabilityTableCoverage()

    const rollout = evaluateMethodizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.methodizabilityStatusService.pingPostgres(),
      existingMethodizabilityTableCount: methodizabilityTableCoverage.existingMethodizabilityTableCount,
      workspaceUsageLimitsTableExists: methodizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: methodizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: methodizabilityTableCoverage.billingRecordsTableExists,
    })

    return methodizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMethodizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMethodizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.methodizabilityStatusService.getWorkspaceMethodizabilityInventory(
        workspaceId,
      )
    const records = buildMethodizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.methodizabilityStatusService.pingPostgres()
    const stats = buildMethodizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return methodizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMethodizabilityAdminActions(),
      guidance: getMethodizabilityAdminGuidance({ stats }),
    })
  }

  async executeMethodizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_methodizability_summary'
    },
  ) {
    this.assertCanManageMethodizability(authContext)

    const payload = methodizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_methodizability_summary': {
        const summary = await this.getWorkspaceMethodizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return methodizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed methodizability summary with ${summary.stats.methodizabilityPercent}% workspace limit methodizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMethodizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production methodizability tools.',
    })
  }
}
