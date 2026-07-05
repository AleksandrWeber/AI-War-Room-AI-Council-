import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOptimizabilityRolloutGuidance,
  optimizabilityAdminActionRequestSchema,
  optimizabilityAdminActionResponseSchema,
  optimizabilityAdminSummaryResponseSchema,
  optimizabilityCapabilitiesResponseSchema,
  optimizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOptimizabilityAdminRecords,
  buildOptimizabilityAdminStats,
  getOptimizabilityAdminGuidance,
  resolveOptimizabilityAdminActions,
} from './optimizability-admin.helpers.js'
import { evaluateOptimizabilityRollout } from './optimizability-rollout.helpers.js'
import { OptimizabilityStatusService } from './optimizability-status.service.js'

@Injectable()
export class OptimizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly optimizabilityStatusService: OptimizabilityStatusService,
  ) {}

  getCapabilities() {
    return optimizabilityCapabilitiesResponseSchema.parse({
      supportsOptimizabilityRollout: true,
      supportsOptimizabilityAdminTools: true,
      supportsModelHealthOptimizabilitySignals: true,
      supportsModelRegistryOptimizabilitySignals: true,
      guidance: getOptimizabilityRolloutGuidance(),
    })
  }

  async getOptimizabilityRollout() {
    const optimizabilityTableCoverage =
      await this.optimizabilityStatusService.getOptimizabilityTableCoverage()

    const rollout = evaluateOptimizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.optimizabilityStatusService.pingPostgres(),
      existingOptimizabilityTableCount: optimizabilityTableCoverage.existingOptimizabilityTableCount,
      modelHealthEventsTableExists: optimizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: optimizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: optimizabilityTableCoverage.billingRecordsTableExists,
    })

    return optimizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOptimizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOptimizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.optimizabilityStatusService.getWorkspaceOptimizabilityInventory(
        workspaceId,
      )
    const records = buildOptimizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.optimizabilityStatusService.pingPostgres()
    const stats = buildOptimizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return optimizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOptimizabilityAdminActions(),
      guidance: getOptimizabilityAdminGuidance({ stats }),
    })
  }

  async executeOptimizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_optimizability_summary'
    },
  ) {
    this.assertCanManageOptimizability(authContext)

    const payload = optimizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_optimizability_summary': {
        const summary = await this.getWorkspaceOptimizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return optimizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed optimizability summary with ${summary.stats.optimizabilityPercent}% model health optimizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOptimizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production optimizability tools.',
    })
  }
}
