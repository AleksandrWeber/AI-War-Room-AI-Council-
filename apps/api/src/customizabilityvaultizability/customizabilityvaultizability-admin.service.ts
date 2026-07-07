import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCustomizabilityvaultizabilityRolloutGuidance,
  customizabilityvaultizabilityAdminActionRequestSchema,
  customizabilityvaultizabilityAdminActionResponseSchema,
  customizabilityvaultizabilityAdminSummaryResponseSchema,
  customizabilityvaultizabilityCapabilitiesResponseSchema,
  customizabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCustomizabilityvaultizabilityAdminRecords,
  buildCustomizabilityvaultizabilityAdminStats,
  getCustomizabilityvaultizabilityAdminGuidance,
  resolveCustomizabilityvaultizabilityAdminActions,
} from './customizabilityvaultizability-admin.helpers.js'
import { evaluateCustomizabilityvaultizabilityRollout } from './customizabilityvaultizability-rollout.helpers.js'
import { CustomizabilityvaultizabilityStatusService } from './customizabilityvaultizability-status.service.js'

@Injectable()
export class CustomizabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly customizabilityvaultizabilityStatusService: CustomizabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return customizabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsCustomizabilityvaultizabilityRollout: true,
      supportsCustomizabilityvaultizabilityAdminTools: true,
      supportsMembershipCustomizabilityvaultizabilitySignals: true,
      supportsUsageEventCustomizabilityvaultizabilitySignals: true,
      guidance: getCustomizabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getCustomizabilityvaultizabilityRollout() {
    const customizabilityvaultizabilityTableCoverage =
      await this.customizabilityvaultizabilityStatusService.getCustomizabilityvaultizabilityTableCoverage()

    const rollout = evaluateCustomizabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.customizabilityvaultizabilityStatusService.pingPostgres(),
      existingCustomizabilityvaultizabilityTableCount: customizabilityvaultizabilityTableCoverage.existingCustomizabilityvaultizabilityTableCount,
      workspaceMembershipsTableExists: customizabilityvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: customizabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: customizabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return customizabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCustomizabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCustomizabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.customizabilityvaultizabilityStatusService.getWorkspaceCustomizabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildCustomizabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.customizabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildCustomizabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return customizabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCustomizabilityvaultizabilityAdminActions(),
      guidance: getCustomizabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeCustomizabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_customizabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageCustomizabilityvaultizability(authContext)

    const payload = customizabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_customizabilityvaultizability_summary': {
        const summary = await this.getWorkspaceCustomizabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return customizabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed customizabilityvaultizability summary with ${summary.stats.customizabilityvaultizabilityPercent}% membership customizabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCustomizabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production customizabilityvaultizability tools.',
    })
  }
}
