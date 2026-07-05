import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMaterializabilityRolloutGuidance,
  materializabilityAdminActionRequestSchema,
  materializabilityAdminActionResponseSchema,
  materializabilityAdminSummaryResponseSchema,
  materializabilityCapabilitiesResponseSchema,
  materializabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMaterializabilityAdminRecords,
  buildMaterializabilityAdminStats,
  getMaterializabilityAdminGuidance,
  resolveMaterializabilityAdminActions,
} from './materializability-admin.helpers.js'
import { evaluateMaterializabilityRollout } from './materializability-rollout.helpers.js'
import { MaterializabilityStatusService } from './materializability-status.service.js'

@Injectable()
export class MaterializabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly materializabilityStatusService: MaterializabilityStatusService,
  ) {}

  getCapabilities() {
    return materializabilityCapabilitiesResponseSchema.parse({
      supportsMaterializabilityRollout: true,
      supportsMaterializabilityAdminTools: true,
      supportsWorkflowMaterializabilitySignals: true,
      supportsArtifactMaterializabilitySignals: true,
      guidance: getMaterializabilityRolloutGuidance(),
    })
  }

  async getMaterializabilityRollout() {
    const materializabilityTableCoverage =
      await this.materializabilityStatusService.getMaterializabilityTableCoverage()

    const rollout = evaluateMaterializabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.materializabilityStatusService.pingPostgres(),
      existingMaterializabilityTableCount: materializabilityTableCoverage.existingMaterializabilityTableCount,
      runWorkflowsTableExists: materializabilityTableCoverage.runWorkflowsTableExists,
      artifactsTableExists: materializabilityTableCoverage.artifactsTableExists,
      billingNotificationsTableExists: materializabilityTableCoverage.billingNotificationsTableExists,
    })

    return materializabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMaterializabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMaterializability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.materializabilityStatusService.getWorkspaceMaterializabilityInventory(
        workspaceId,
      )
    const records = buildMaterializabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.materializabilityStatusService.pingPostgres()
    const stats = buildMaterializabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return materializabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMaterializabilityAdminActions(),
      guidance: getMaterializabilityAdminGuidance({ stats }),
    })
  }

  async executeMaterializabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_materializability_summary'
    },
  ) {
    this.assertCanManageMaterializability(authContext)

    const payload = materializabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_materializability_summary': {
        const summary = await this.getWorkspaceMaterializabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return materializabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed materializability summary with ${summary.stats.materializabilityPercent}% workflow materializability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMaterializability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production materializability tools.',
    })
  }
}
