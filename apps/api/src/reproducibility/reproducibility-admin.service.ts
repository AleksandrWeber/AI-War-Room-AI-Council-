import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReproducibilityRolloutGuidance,
  reproducibilityAdminActionRequestSchema,
  reproducibilityAdminActionResponseSchema,
  reproducibilityAdminSummaryResponseSchema,
  reproducibilityCapabilitiesResponseSchema,
  reproducibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReproducibilityAdminRecords,
  buildReproducibilityAdminStats,
  getReproducibilityAdminGuidance,
  resolveReproducibilityAdminActions,
} from './reproducibility-admin.helpers.js'
import { evaluateReproducibilityRollout } from './reproducibility-rollout.helpers.js'
import { ReproducibilityStatusService } from './reproducibility-status.service.js'

@Injectable()
export class ReproducibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly reproducibilityStatusService: ReproducibilityStatusService,
  ) {}

  getCapabilities() {
    return reproducibilityCapabilitiesResponseSchema.parse({
      supportsReproducibilityRollout: true,
      supportsReproducibilityAdminTools: true,
      supportsIdempotencyReproducibilitySignals: true,
      supportsWorkflowReproducibilitySignals: true,
      guidance: getReproducibilityRolloutGuidance(),
    })
  }

  async getReproducibilityRollout() {
    const reproducibilityTableCoverage =
      await this.reproducibilityStatusService.getReproducibilityTableCoverage()

    const rollout = evaluateReproducibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.reproducibilityStatusService.pingPostgres(),
      existingReproducibilityTableCount: reproducibilityTableCoverage.existingReproducibilityTableCount,
      idempotencyKeysTableExists: reproducibilityTableCoverage.idempotencyKeysTableExists,
      runWorkflowsTableExists: reproducibilityTableCoverage.runWorkflowsTableExists,
      agentOutputsTableExists: reproducibilityTableCoverage.agentOutputsTableExists,
    })

    return reproducibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReproducibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReproducibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.reproducibilityStatusService.getWorkspaceReproducibilityInventory(
        workspaceId,
      )
    const records = buildReproducibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.reproducibilityStatusService.pingPostgres()
    const stats = buildReproducibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return reproducibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReproducibilityAdminActions(),
      guidance: getReproducibilityAdminGuidance({ stats }),
    })
  }

  async executeReproducibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_reproducibility_summary'
    },
  ) {
    this.assertCanManageReproducibility(authContext)

    const payload = reproducibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_reproducibility_summary': {
        const summary = await this.getWorkspaceReproducibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return reproducibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed reproducibility summary with ${summary.stats.reproducibilityPercent}% idempotency reproducibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReproducibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production reproducibility tools.',
    })
  }
}
