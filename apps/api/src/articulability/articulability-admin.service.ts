import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getArticulabilityRolloutGuidance,
  articulabilityAdminActionRequestSchema,
  articulabilityAdminActionResponseSchema,
  articulabilityAdminSummaryResponseSchema,
  articulabilityCapabilitiesResponseSchema,
  articulabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildArticulabilityAdminRecords,
  buildArticulabilityAdminStats,
  getArticulabilityAdminGuidance,
  resolveArticulabilityAdminActions,
} from './articulability-admin.helpers.js'
import { evaluateArticulabilityRollout } from './articulability-rollout.helpers.js'
import { ArticulabilityStatusService } from './articulability-status.service.js'

@Injectable()
export class ArticulabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly articulabilityStatusService: ArticulabilityStatusService,
  ) {}

  getCapabilities() {
    return articulabilityCapabilitiesResponseSchema.parse({
      supportsArticulabilityRollout: true,
      supportsArticulabilityAdminTools: true,
      supportsArtifactArticulabilitySignals: true,
      supportsWorkflowArticulabilitySignals: true,
      guidance: getArticulabilityRolloutGuidance(),
    })
  }

  async getArticulabilityRollout() {
    const articulabilityTableCoverage =
      await this.articulabilityStatusService.getArticulabilityTableCoverage()

    const rollout = evaluateArticulabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.articulabilityStatusService.pingPostgres(),
      existingArticulabilityTableCount: articulabilityTableCoverage.existingArticulabilityTableCount,
      artifactsTableExists: articulabilityTableCoverage.artifactsTableExists,
      runWorkflowsTableExists: articulabilityTableCoverage.runWorkflowsTableExists,
      billingNotificationsTableExists: articulabilityTableCoverage.billingNotificationsTableExists,
    })

    return articulabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceArticulabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageArticulability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.articulabilityStatusService.getWorkspaceArticulabilityInventory(
        workspaceId,
      )
    const records = buildArticulabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.articulabilityStatusService.pingPostgres()
    const stats = buildArticulabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return articulabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveArticulabilityAdminActions(),
      guidance: getArticulabilityAdminGuidance({ stats }),
    })
  }

  async executeArticulabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_articulability_summary'
    },
  ) {
    this.assertCanManageArticulability(authContext)

    const payload = articulabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_articulability_summary': {
        const summary = await this.getWorkspaceArticulabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return articulabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed articulability summary with ${summary.stats.articulabilityPercent}% artifact articulability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageArticulability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production articulability tools.',
    })
  }
}
