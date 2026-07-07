import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getResponsivenessvaultizabilityRolloutGuidance,
  responsivenessvaultizabilityAdminActionRequestSchema,
  responsivenessvaultizabilityAdminActionResponseSchema,
  responsivenessvaultizabilityAdminSummaryResponseSchema,
  responsivenessvaultizabilityCapabilitiesResponseSchema,
  responsivenessvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildResponsivenessvaultizabilityAdminRecords,
  buildResponsivenessvaultizabilityAdminStats,
  getResponsivenessvaultizabilityAdminGuidance,
  resolveResponsivenessvaultizabilityAdminActions,
} from './responsivenessvaultizability-admin.helpers.js'
import { evaluateResponsivenessvaultizabilityRollout } from './responsivenessvaultizability-rollout.helpers.js'
import { ResponsivenessvaultizabilityStatusService } from './responsivenessvaultizability-status.service.js'

@Injectable()
export class ResponsivenessvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly responsivenessvaultizabilityStatusService: ResponsivenessvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return responsivenessvaultizabilityCapabilitiesResponseSchema.parse({
      supportsResponsivenessvaultizabilityRollout: true,
      supportsResponsivenessvaultizabilityAdminTools: true,
      supportsMembershipResponsivenessvaultizabilitySignals: true,
      supportsUsageEventResponsivenessvaultizabilitySignals: true,
      guidance: getResponsivenessvaultizabilityRolloutGuidance(),
    })
  }

  async getResponsivenessvaultizabilityRollout() {
    const responsivenessvaultizabilityTableCoverage =
      await this.responsivenessvaultizabilityStatusService.getResponsivenessvaultizabilityTableCoverage()

    const rollout = evaluateResponsivenessvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.responsivenessvaultizabilityStatusService.pingPostgres(),
      existingResponsivenessvaultizabilityTableCount: responsivenessvaultizabilityTableCoverage.existingResponsivenessvaultizabilityTableCount,
      workspaceMembershipsTableExists: responsivenessvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: responsivenessvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: responsivenessvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return responsivenessvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceResponsivenessvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageResponsivenessvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.responsivenessvaultizabilityStatusService.getWorkspaceResponsivenessvaultizabilityInventory(
        workspaceId,
      )
    const records = buildResponsivenessvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.responsivenessvaultizabilityStatusService.pingPostgres()
    const stats = buildResponsivenessvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return responsivenessvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveResponsivenessvaultizabilityAdminActions(),
      guidance: getResponsivenessvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeResponsivenessvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_responsivenessvaultizability_summary'
    },
  ) {
    this.assertCanManageResponsivenessvaultizability(authContext)

    const payload = responsivenessvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_responsivenessvaultizability_summary': {
        const summary = await this.getWorkspaceResponsivenessvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return responsivenessvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed responsivenessvaultizability summary with ${summary.stats.responsivenessvaultizabilityPercent}% membership responsivenessvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageResponsivenessvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production responsivenessvaultizability tools.',
    })
  }
}
