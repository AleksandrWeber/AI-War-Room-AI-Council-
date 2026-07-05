import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMythicizabilityRolloutGuidance,
  mythicizabilityAdminActionRequestSchema,
  mythicizabilityAdminActionResponseSchema,
  mythicizabilityAdminSummaryResponseSchema,
  mythicizabilityCapabilitiesResponseSchema,
  mythicizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMythicizabilityAdminRecords,
  buildMythicizabilityAdminStats,
  getMythicizabilityAdminGuidance,
  resolveMythicizabilityAdminActions,
} from './mythicizability-admin.helpers.js'
import { evaluateMythicizabilityRollout } from './mythicizability-rollout.helpers.js'
import { MythicizabilityStatusService } from './mythicizability-status.service.js'

@Injectable()
export class MythicizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly mythicizabilityStatusService: MythicizabilityStatusService,
  ) {}

  getCapabilities() {
    return mythicizabilityCapabilitiesResponseSchema.parse({
      supportsMythicizabilityRollout: true,
      supportsMythicizabilityAdminTools: true,
      supportsArtifactMythicizabilitySignals: true,
      supportsWorkflowMythicizabilitySignals: true,
      guidance: getMythicizabilityRolloutGuidance(),
    })
  }

  async getMythicizabilityRollout() {
    const mythicizabilityTableCoverage =
      await this.mythicizabilityStatusService.getMythicizabilityTableCoverage()

    const rollout = evaluateMythicizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.mythicizabilityStatusService.pingPostgres(),
      existingMythicizabilityTableCount: mythicizabilityTableCoverage.existingMythicizabilityTableCount,
      artifactsTableExists: mythicizabilityTableCoverage.artifactsTableExists,
      runWorkflowsTableExists: mythicizabilityTableCoverage.runWorkflowsTableExists,
      billingNotificationsTableExists: mythicizabilityTableCoverage.billingNotificationsTableExists,
    })

    return mythicizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMythicizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMythicizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.mythicizabilityStatusService.getWorkspaceMythicizabilityInventory(
        workspaceId,
      )
    const records = buildMythicizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.mythicizabilityStatusService.pingPostgres()
    const stats = buildMythicizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return mythicizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMythicizabilityAdminActions(),
      guidance: getMythicizabilityAdminGuidance({ stats }),
    })
  }

  async executeMythicizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_mythicizability_summary'
    },
  ) {
    this.assertCanManageMythicizability(authContext)

    const payload = mythicizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_mythicizability_summary': {
        const summary = await this.getWorkspaceMythicizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return mythicizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed mythicizability summary with ${summary.stats.mythicizabilityPercent}% artifact mythicizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMythicizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production mythicizability tools.',
    })
  }
}
