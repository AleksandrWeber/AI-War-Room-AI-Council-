import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLinkabilityRolloutGuidance,
  linkabilityAdminActionRequestSchema,
  linkabilityAdminActionResponseSchema,
  linkabilityAdminSummaryResponseSchema,
  linkabilityCapabilitiesResponseSchema,
  linkabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLinkabilityAdminRecords,
  buildLinkabilityAdminStats,
  getLinkabilityAdminGuidance,
  resolveLinkabilityAdminActions,
} from './linkability-admin.helpers.js'
import { evaluateLinkabilityRollout } from './linkability-rollout.helpers.js'
import { LinkabilityStatusService } from './linkability-status.service.js'

@Injectable()
export class LinkabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly linkabilityStatusService: LinkabilityStatusService,
  ) {}

  getCapabilities() {
    return linkabilityCapabilitiesResponseSchema.parse({
      supportsLinkabilityRollout: true,
      supportsLinkabilityAdminTools: true,
      supportsWorkflowLinkabilitySignals: true,
      supportsArtifactLinkabilitySignals: true,
      guidance: getLinkabilityRolloutGuidance(),
    })
  }

  async getLinkabilityRollout() {
    const linkabilityTableCoverage =
      await this.linkabilityStatusService.getLinkabilityTableCoverage()

    const rollout = evaluateLinkabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.linkabilityStatusService.pingPostgres(),
      existingLinkabilityTableCount: linkabilityTableCoverage.existingLinkabilityTableCount,
      runWorkflowsTableExists: linkabilityTableCoverage.runWorkflowsTableExists,
      artifactsTableExists: linkabilityTableCoverage.artifactsTableExists,
      billingRecordsTableExists: linkabilityTableCoverage.billingRecordsTableExists,
    })

    return linkabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLinkabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLinkability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.linkabilityStatusService.getWorkspaceLinkabilityInventory(
        workspaceId,
      )
    const records = buildLinkabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.linkabilityStatusService.pingPostgres()
    const stats = buildLinkabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return linkabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLinkabilityAdminActions(),
      guidance: getLinkabilityAdminGuidance({ stats }),
    })
  }

  async executeLinkabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_linkability_summary'
    },
  ) {
    this.assertCanManageLinkability(authContext)

    const payload = linkabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_linkability_summary': {
        const summary = await this.getWorkspaceLinkabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return linkabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed linkability summary with ${summary.stats.linkabilityPercent}% workflow linkability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLinkability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production linkability tools.',
    })
  }
}
