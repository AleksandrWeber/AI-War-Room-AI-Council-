import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMorphizabilityRolloutGuidance,
  morphizabilityAdminActionRequestSchema,
  morphizabilityAdminActionResponseSchema,
  morphizabilityAdminSummaryResponseSchema,
  morphizabilityCapabilitiesResponseSchema,
  morphizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMorphizabilityAdminRecords,
  buildMorphizabilityAdminStats,
  getMorphizabilityAdminGuidance,
  resolveMorphizabilityAdminActions,
} from './morphizability-admin.helpers.js'
import { evaluateMorphizabilityRollout } from './morphizability-rollout.helpers.js'
import { MorphizabilityStatusService } from './morphizability-status.service.js'

@Injectable()
export class MorphizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly morphizabilityStatusService: MorphizabilityStatusService,
  ) {}

  getCapabilities() {
    return morphizabilityCapabilitiesResponseSchema.parse({
      supportsMorphizabilityRollout: true,
      supportsMorphizabilityAdminTools: true,
      supportsWorkspaceLimitMorphizabilitySignals: true,
      supportsUsageEventMorphizabilitySignals: true,
      guidance: getMorphizabilityRolloutGuidance(),
    })
  }

  async getMorphizabilityRollout() {
    const morphizabilityTableCoverage =
      await this.morphizabilityStatusService.getMorphizabilityTableCoverage()

    const rollout = evaluateMorphizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.morphizabilityStatusService.pingPostgres(),
      existingMorphizabilityTableCount: morphizabilityTableCoverage.existingMorphizabilityTableCount,
      workspaceUsageLimitsTableExists: morphizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: morphizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: morphizabilityTableCoverage.billingRecordsTableExists,
    })

    return morphizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMorphizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMorphizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.morphizabilityStatusService.getWorkspaceMorphizabilityInventory(
        workspaceId,
      )
    const records = buildMorphizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.morphizabilityStatusService.pingPostgres()
    const stats = buildMorphizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return morphizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMorphizabilityAdminActions(),
      guidance: getMorphizabilityAdminGuidance({ stats }),
    })
  }

  async executeMorphizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_morphizability_summary'
    },
  ) {
    this.assertCanManageMorphizability(authContext)

    const payload = morphizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_morphizability_summary': {
        const summary = await this.getWorkspaceMorphizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return morphizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed morphizability summary with ${summary.stats.morphizabilityPercent}% workspace limit morphizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMorphizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production morphizability tools.',
    })
  }
}
