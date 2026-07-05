import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMemorabilityRolloutGuidance,
  memorabilityAdminActionRequestSchema,
  memorabilityAdminActionResponseSchema,
  memorabilityAdminSummaryResponseSchema,
  memorabilityCapabilitiesResponseSchema,
  memorabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMemorabilityAdminRecords,
  buildMemorabilityAdminStats,
  getMemorabilityAdminGuidance,
  resolveMemorabilityAdminActions,
} from './memorability-admin.helpers.js'
import { evaluateMemorabilityRollout } from './memorability-rollout.helpers.js'
import { MemorabilityStatusService } from './memorability-status.service.js'

@Injectable()
export class MemorabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly memorabilityStatusService: MemorabilityStatusService,
  ) {}

  getCapabilities() {
    return memorabilityCapabilitiesResponseSchema.parse({
      supportsMemorabilityRollout: true,
      supportsMemorabilityAdminTools: true,
      supportsArtifactMemorabilitySignals: true,
      supportsWorkflowMemorabilitySignals: true,
      guidance: getMemorabilityRolloutGuidance(),
    })
  }

  async getMemorabilityRollout() {
    const memorabilityTableCoverage =
      await this.memorabilityStatusService.getMemorabilityTableCoverage()

    const rollout = evaluateMemorabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.memorabilityStatusService.pingPostgres(),
      existingMemorabilityTableCount: memorabilityTableCoverage.existingMemorabilityTableCount,
      artifactsTableExists: memorabilityTableCoverage.artifactsTableExists,
      runWorkflowsTableExists: memorabilityTableCoverage.runWorkflowsTableExists,
      idempotencyKeysTableExists: memorabilityTableCoverage.idempotencyKeysTableExists,
    })

    return memorabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMemorabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMemorability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.memorabilityStatusService.getWorkspaceMemorabilityInventory(
        workspaceId,
      )
    const records = buildMemorabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.memorabilityStatusService.pingPostgres()
    const stats = buildMemorabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return memorabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMemorabilityAdminActions(),
      guidance: getMemorabilityAdminGuidance({ stats }),
    })
  }

  async executeMemorabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_memorability_summary'
    },
  ) {
    this.assertCanManageMemorability(authContext)

    const payload = memorabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_memorability_summary': {
        const summary = await this.getWorkspaceMemorabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return memorabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed memorability summary with ${summary.stats.memorabilityPercent}% artifact memorability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMemorability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production memorability tools.',
    })
  }
}
