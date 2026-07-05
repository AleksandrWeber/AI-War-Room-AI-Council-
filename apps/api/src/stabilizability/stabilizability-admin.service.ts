import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getStabilizabilityRolloutGuidance,
  stabilizabilityAdminActionRequestSchema,
  stabilizabilityAdminActionResponseSchema,
  stabilizabilityAdminSummaryResponseSchema,
  stabilizabilityCapabilitiesResponseSchema,
  stabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildStabilizabilityAdminRecords,
  buildStabilizabilityAdminStats,
  getStabilizabilityAdminGuidance,
  resolveStabilizabilityAdminActions,
} from './stabilizability-admin.helpers.js'
import { evaluateStabilizabilityRollout } from './stabilizability-rollout.helpers.js'
import { StabilizabilityStatusService } from './stabilizability-status.service.js'

@Injectable()
export class StabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly stabilizabilityStatusService: StabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return stabilizabilityCapabilitiesResponseSchema.parse({
      supportsStabilizabilityRollout: true,
      supportsStabilizabilityAdminTools: true,
      supportsProviderCredentialStabilizabilitySignals: true,
      supportsModelRegistryStabilizabilitySignals: true,
      guidance: getStabilizabilityRolloutGuidance(),
    })
  }

  async getStabilizabilityRollout() {
    const stabilizabilityTableCoverage =
      await this.stabilizabilityStatusService.getStabilizabilityTableCoverage()

    const rollout = evaluateStabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.stabilizabilityStatusService.pingPostgres(),
      existingStabilizabilityTableCount: stabilizabilityTableCoverage.existingStabilizabilityTableCount,
      workspaceProviderCredentialsTableExists: stabilizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: stabilizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: stabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return stabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceStabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageStabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.stabilizabilityStatusService.getWorkspaceStabilizabilityInventory(
        workspaceId,
      )
    const records = buildStabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.stabilizabilityStatusService.pingPostgres()
    const stats = buildStabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return stabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveStabilizabilityAdminActions(),
      guidance: getStabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeStabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_stabilizability_summary'
    },
  ) {
    this.assertCanManageStabilizability(authContext)

    const payload = stabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_stabilizability_summary': {
        const summary = await this.getWorkspaceStabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return stabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed stabilizability summary with ${summary.stats.stabilizabilityPercent}% provider credential stabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageStabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production stabilizability tools.',
    })
  }
}
