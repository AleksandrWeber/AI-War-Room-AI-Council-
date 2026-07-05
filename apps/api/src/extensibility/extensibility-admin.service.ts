import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getExtensibilityRolloutGuidance,
  extensibilityAdminActionRequestSchema,
  extensibilityAdminActionResponseSchema,
  extensibilityAdminSummaryResponseSchema,
  extensibilityCapabilitiesResponseSchema,
  extensibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildExtensibilityAdminRecords,
  buildExtensibilityAdminStats,
  getExtensibilityAdminGuidance,
  resolveExtensibilityAdminActions,
} from './extensibility-admin.helpers.js'
import { evaluateExtensibilityRollout } from './extensibility-rollout.helpers.js'
import { ExtensibilityStatusService } from './extensibility-status.service.js'

@Injectable()
export class ExtensibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly extensibilityStatusService: ExtensibilityStatusService,
  ) {}

  getCapabilities() {
    return extensibilityCapabilitiesResponseSchema.parse({
      supportsExtensibilityRollout: true,
      supportsExtensibilityAdminTools: true,
      supportsAgentOutputExtensibilitySignals: true,
      supportsArtifactExtensibilitySignals: true,
      guidance: getExtensibilityRolloutGuidance(),
    })
  }

  async getExtensibilityRollout() {
    const extensibilityTableCoverage =
      await this.extensibilityStatusService.getExtensibilityTableCoverage()

    const rollout = evaluateExtensibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.extensibilityStatusService.pingPostgres(),
      existingExtensibilityTableCount: extensibilityTableCoverage.existingExtensibilityTableCount,
      agentOutputsTableExists: extensibilityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: extensibilityTableCoverage.artifactsTableExists,
      moderatorSynthesesTableExists: extensibilityTableCoverage.moderatorSynthesesTableExists,
    })

    return extensibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceExtensibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageExtensibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.extensibilityStatusService.getWorkspaceExtensibilityInventory(
        workspaceId,
      )
    const records = buildExtensibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.extensibilityStatusService.pingPostgres()
    const stats = buildExtensibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return extensibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveExtensibilityAdminActions(),
      guidance: getExtensibilityAdminGuidance({ stats }),
    })
  }

  async executeExtensibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_extensibility_summary'
    },
  ) {
    this.assertCanManageExtensibility(authContext)

    const payload = extensibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_extensibility_summary': {
        const summary = await this.getWorkspaceExtensibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return extensibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed extensibility summary with ${summary.stats.extensibilityPercent}% agent output extensibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageExtensibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production extensibility tools.',
    })
  }
}
