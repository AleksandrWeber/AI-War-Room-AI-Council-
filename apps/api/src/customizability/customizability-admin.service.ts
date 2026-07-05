import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCustomizabilityRolloutGuidance,
  customizabilityAdminActionRequestSchema,
  customizabilityAdminActionResponseSchema,
  customizabilityAdminSummaryResponseSchema,
  customizabilityCapabilitiesResponseSchema,
  customizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCustomizabilityAdminRecords,
  buildCustomizabilityAdminStats,
  getCustomizabilityAdminGuidance,
  resolveCustomizabilityAdminActions,
} from './customizability-admin.helpers.js'
import { evaluateCustomizabilityRollout } from './customizability-rollout.helpers.js'
import { CustomizabilityStatusService } from './customizability-status.service.js'

@Injectable()
export class CustomizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly customizabilityStatusService: CustomizabilityStatusService,
  ) {}

  getCapabilities() {
    return customizabilityCapabilitiesResponseSchema.parse({
      supportsCustomizabilityRollout: true,
      supportsCustomizabilityAdminTools: true,
      supportsWorkflowCustomizabilitySignals: true,
      supportsArtifactCustomizabilitySignals: true,
      guidance: getCustomizabilityRolloutGuidance(),
    })
  }

  async getCustomizabilityRollout() {
    const customizabilityTableCoverage =
      await this.customizabilityStatusService.getCustomizabilityTableCoverage()

    const rollout = evaluateCustomizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.customizabilityStatusService.pingPostgres(),
      existingCustomizabilityTableCount: customizabilityTableCoverage.existingCustomizabilityTableCount,
      runWorkflowsTableExists: customizabilityTableCoverage.runWorkflowsTableExists,
      artifactsTableExists: customizabilityTableCoverage.artifactsTableExists,
      usageEventsTableExists: customizabilityTableCoverage.usageEventsTableExists,
    })

    return customizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCustomizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCustomizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.customizabilityStatusService.getWorkspaceCustomizabilityInventory(
        workspaceId,
      )
    const records = buildCustomizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.customizabilityStatusService.pingPostgres()
    const stats = buildCustomizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return customizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCustomizabilityAdminActions(),
      guidance: getCustomizabilityAdminGuidance({ stats }),
    })
  }

  async executeCustomizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_customizability_summary'
    },
  ) {
    this.assertCanManageCustomizability(authContext)

    const payload = customizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_customizability_summary': {
        const summary = await this.getWorkspaceCustomizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return customizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed customizability summary with ${summary.stats.customizabilityPercent}% workflow customizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCustomizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production customizability tools.',
    })
  }
}
