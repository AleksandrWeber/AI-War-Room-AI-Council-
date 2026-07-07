import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSecurityizabilityRolloutGuidance,
  securityizabilityAdminActionRequestSchema,
  securityizabilityAdminActionResponseSchema,
  securityizabilityAdminSummaryResponseSchema,
  securityizabilityCapabilitiesResponseSchema,
  securityizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSecurityizabilityAdminRecords,
  buildSecurityizabilityAdminStats,
  getSecurityizabilityAdminGuidance,
  resolveSecurityizabilityAdminActions,
} from './securityizability-admin.helpers.js'
import { evaluateSecurityizabilityRollout } from './securityizability-rollout.helpers.js'
import { SecurityizabilityStatusService } from './securityizability-status.service.js'

@Injectable()
export class SecurityizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly securityizabilityStatusService: SecurityizabilityStatusService,
  ) {}

  getCapabilities() {
    return securityizabilityCapabilitiesResponseSchema.parse({
      supportsSecurityizabilityRollout: true,
      supportsSecurityizabilityAdminTools: true,
      supportsMembershipSecurityizabilitySignals: true,
      supportsUsageEventSecurityizabilitySignals: true,
      guidance: getSecurityizabilityRolloutGuidance(),
    })
  }

  async getSecurityizabilityRollout() {
    const securityizabilityTableCoverage =
      await this.securityizabilityStatusService.getSecurityizabilityTableCoverage()

    const rollout = evaluateSecurityizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.securityizabilityStatusService.pingPostgres(),
      existingSecurityizabilityTableCount: securityizabilityTableCoverage.existingSecurityizabilityTableCount,
      workspaceMembershipsTableExists: securityizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: securityizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: securityizabilityTableCoverage.billingNotificationsTableExists,
    })

    return securityizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSecurityizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSecurityizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.securityizabilityStatusService.getWorkspaceSecurityizabilityInventory(
        workspaceId,
      )
    const records = buildSecurityizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.securityizabilityStatusService.pingPostgres()
    const stats = buildSecurityizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return securityizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSecurityizabilityAdminActions(),
      guidance: getSecurityizabilityAdminGuidance({ stats }),
    })
  }

  async executeSecurityizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_securityizability_summary'
    },
  ) {
    this.assertCanManageSecurityizability(authContext)

    const payload = securityizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_securityizability_summary': {
        const summary = await this.getWorkspaceSecurityizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return securityizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed securityizability summary with ${summary.stats.securityizabilityPercent}% membership securityizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSecurityizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production securityizability tools.',
    })
  }
}
