import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLinkabilityvaultizabilityRolloutGuidance,
  linkabilityvaultizabilityAdminActionRequestSchema,
  linkabilityvaultizabilityAdminActionResponseSchema,
  linkabilityvaultizabilityAdminSummaryResponseSchema,
  linkabilityvaultizabilityCapabilitiesResponseSchema,
  linkabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLinkabilityvaultizabilityAdminRecords,
  buildLinkabilityvaultizabilityAdminStats,
  getLinkabilityvaultizabilityAdminGuidance,
  resolveLinkabilityvaultizabilityAdminActions,
} from './linkabilityvaultizability-admin.helpers.js'
import { evaluateLinkabilityvaultizabilityRollout } from './linkabilityvaultizability-rollout.helpers.js'
import { LinkabilityvaultizabilityStatusService } from './linkabilityvaultizability-status.service.js'

@Injectable()
export class LinkabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly linkabilityvaultizabilityStatusService: LinkabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return linkabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsLinkabilityvaultizabilityRollout: true,
      supportsLinkabilityvaultizabilityAdminTools: true,
      supportsMembershipLinkabilityvaultizabilitySignals: true,
      supportsUsageEventLinkabilityvaultizabilitySignals: true,
      guidance: getLinkabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getLinkabilityvaultizabilityRollout() {
    const linkabilityvaultizabilityTableCoverage =
      await this.linkabilityvaultizabilityStatusService.getLinkabilityvaultizabilityTableCoverage()

    const rollout = evaluateLinkabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.linkabilityvaultizabilityStatusService.pingPostgres(),
      existingLinkabilityvaultizabilityTableCount: linkabilityvaultizabilityTableCoverage.existingLinkabilityvaultizabilityTableCount,
      workspaceMembershipsTableExists: linkabilityvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: linkabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: linkabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return linkabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLinkabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLinkabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.linkabilityvaultizabilityStatusService.getWorkspaceLinkabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildLinkabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.linkabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildLinkabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return linkabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLinkabilityvaultizabilityAdminActions(),
      guidance: getLinkabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeLinkabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_linkabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageLinkabilityvaultizability(authContext)

    const payload = linkabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_linkabilityvaultizability_summary': {
        const summary = await this.getWorkspaceLinkabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return linkabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed linkabilityvaultizability summary with ${summary.stats.linkabilityvaultizabilityPercent}% membership linkabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLinkabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production linkabilityvaultizability tools.',
    })
  }
}
