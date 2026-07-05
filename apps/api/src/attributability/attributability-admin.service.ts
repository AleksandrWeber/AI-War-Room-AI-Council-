import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAttributabilityRolloutGuidance,
  attributabilityAdminActionRequestSchema,
  attributabilityAdminActionResponseSchema,
  attributabilityAdminSummaryResponseSchema,
  attributabilityCapabilitiesResponseSchema,
  attributabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAttributabilityAdminRecords,
  buildAttributabilityAdminStats,
  getAttributabilityAdminGuidance,
  resolveAttributabilityAdminActions,
} from './attributability-admin.helpers.js'
import { evaluateAttributabilityRollout } from './attributability-rollout.helpers.js'
import { AttributabilityStatusService } from './attributability-status.service.js'

@Injectable()
export class AttributabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly attributabilityStatusService: AttributabilityStatusService,
  ) {}

  getCapabilities() {
    return attributabilityCapabilitiesResponseSchema.parse({
      supportsAttributabilityRollout: true,
      supportsAttributabilityAdminTools: true,
      supportsAgentOutputAttributabilitySignals: true,
      supportsSynthesisAttributabilitySignals: true,
      guidance: getAttributabilityRolloutGuidance(),
    })
  }

  async getAttributabilityRollout() {
    const attributabilityTableCoverage =
      await this.attributabilityStatusService.getAttributabilityTableCoverage()

    const rollout = evaluateAttributabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.attributabilityStatusService.pingPostgres(),
      existingAttributabilityTableCount: attributabilityTableCoverage.existingAttributabilityTableCount,
      agentOutputsTableExists: attributabilityTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: attributabilityTableCoverage.moderatorSynthesesTableExists,
      artifactsTableExists: attributabilityTableCoverage.artifactsTableExists,
    })

    return attributabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAttributabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAttributability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.attributabilityStatusService.getWorkspaceAttributabilityInventory(
        workspaceId,
      )
    const records = buildAttributabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.attributabilityStatusService.pingPostgres()
    const stats = buildAttributabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return attributabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAttributabilityAdminActions(),
      guidance: getAttributabilityAdminGuidance({ stats }),
    })
  }

  async executeAttributabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_attributability_summary'
    },
  ) {
    this.assertCanManageAttributability(authContext)

    const payload = attributabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_attributability_summary': {
        const summary = await this.getWorkspaceAttributabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return attributabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed attributability summary with ${summary.stats.attributabilityPercent}% agent output attributability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAttributability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production attributability tools.',
    })
  }
}
