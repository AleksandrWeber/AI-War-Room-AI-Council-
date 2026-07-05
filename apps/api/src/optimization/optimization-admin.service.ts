import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOptimizationRolloutGuidance,
  optimizationAdminActionRequestSchema,
  optimizationAdminActionResponseSchema,
  optimizationAdminSummaryResponseSchema,
  optimizationCapabilitiesResponseSchema,
  optimizationRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOptimizationAdminRecords,
  buildOptimizationAdminStats,
  getOptimizationAdminGuidance,
  resolveOptimizationAdminActions,
} from './optimization-admin.helpers.js'
import { evaluateOptimizationRollout } from './optimization-rollout.helpers.js'
import { OptimizationStatusService } from './optimization-status.service.js'

@Injectable()
export class OptimizationAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly optimizationStatusService: OptimizationStatusService,
  ) {}

  getCapabilities() {
    return optimizationCapabilitiesResponseSchema.parse({
      supportsOptimizationRollout: true,
      supportsOptimizationAdminTools: true,
      supportsModelHealthOptimizationSignals: true,
      supportsUsageOptimizationSignals: true,
      guidance: getOptimizationRolloutGuidance(),
    })
  }

  async getOptimizationRollout() {
    const optimizationTableCoverage =
      await this.optimizationStatusService.getOptimizationTableCoverage()

    const rollout = evaluateOptimizationRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity:
        await this.optimizationStatusService.pingPostgres(),
      existingOptimizationTableCount:
        optimizationTableCoverage.existingOptimizationTableCount,
      modelHealthEventsTableExists:
        optimizationTableCoverage.modelHealthEventsTableExists,
      usageEventsTableExists: optimizationTableCoverage.usageEventsTableExists,
    })

    return optimizationRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOptimizationAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOptimization(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.optimizationStatusService.getWorkspaceOptimizationInventory(
        workspaceId,
      )
    const records = buildOptimizationAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.optimizationStatusService.pingPostgres()
    const stats = buildOptimizationAdminStats({
      records,
      postgresConnectivity,
    })

    return optimizationAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOptimizationAdminActions(),
      guidance: getOptimizationAdminGuidance({ stats }),
    })
  }

  async executeOptimizationAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_optimization_summary'
    },
  ) {
    this.assertCanManageOptimization(authContext)

    const payload = optimizationAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_optimization_summary': {
        const summary = await this.getWorkspaceOptimizationAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return optimizationAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed optimization summary with ${summary.stats.optimizationPercent}% model health optimization across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOptimization(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production optimization tools.',
    })
  }
}
