import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRetrievabilityRolloutGuidance,
  retrievabilityAdminActionRequestSchema,
  retrievabilityAdminActionResponseSchema,
  retrievabilityAdminSummaryResponseSchema,
  retrievabilityCapabilitiesResponseSchema,
  retrievabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRetrievabilityAdminRecords,
  buildRetrievabilityAdminStats,
  getRetrievabilityAdminGuidance,
  resolveRetrievabilityAdminActions,
} from './retrievability-admin.helpers.js'
import { evaluateRetrievabilityRollout } from './retrievability-rollout.helpers.js'
import { RetrievabilityStatusService } from './retrievability-status.service.js'

@Injectable()
export class RetrievabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly retrievabilityStatusService: RetrievabilityStatusService,
  ) {}

  getCapabilities() {
    return retrievabilityCapabilitiesResponseSchema.parse({
      supportsRetrievabilityRollout: true,
      supportsRetrievabilityAdminTools: true,
      supportsShieldScanRetrievabilitySignals: true,
      supportsAgentOutputRetrievabilitySignals: true,
      guidance: getRetrievabilityRolloutGuidance(),
    })
  }

  async getRetrievabilityRollout() {
    const retrievabilityTableCoverage =
      await this.retrievabilityStatusService.getRetrievabilityTableCoverage()

    const rollout = evaluateRetrievabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.retrievabilityStatusService.pingPostgres(),
      existingRetrievabilityTableCount: retrievabilityTableCoverage.existingRetrievabilityTableCount,
      shieldScansTableExists: retrievabilityTableCoverage.shieldScansTableExists,
      agentOutputsTableExists: retrievabilityTableCoverage.agentOutputsTableExists,
      idempotencyKeysTableExists: retrievabilityTableCoverage.idempotencyKeysTableExists,
    })

    return retrievabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRetrievabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRetrievability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.retrievabilityStatusService.getWorkspaceRetrievabilityInventory(
        workspaceId,
      )
    const records = buildRetrievabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.retrievabilityStatusService.pingPostgres()
    const stats = buildRetrievabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return retrievabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRetrievabilityAdminActions(),
      guidance: getRetrievabilityAdminGuidance({ stats }),
    })
  }

  async executeRetrievabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_retrievability_summary'
    },
  ) {
    this.assertCanManageRetrievability(authContext)

    const payload = retrievabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_retrievability_summary': {
        const summary = await this.getWorkspaceRetrievabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return retrievabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed retrievability summary with ${summary.stats.retrievabilityPercent}% shield scan retrievability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRetrievability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production retrievability tools.',
    })
  }
}
