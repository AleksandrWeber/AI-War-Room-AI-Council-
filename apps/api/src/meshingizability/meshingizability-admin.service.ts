import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMeshingizabilityRolloutGuidance,
  meshingizabilityAdminActionRequestSchema,
  meshingizabilityAdminActionResponseSchema,
  meshingizabilityAdminSummaryResponseSchema,
  meshingizabilityCapabilitiesResponseSchema,
  meshingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMeshingizabilityAdminRecords,
  buildMeshingizabilityAdminStats,
  getMeshingizabilityAdminGuidance,
  resolveMeshingizabilityAdminActions,
} from './meshingizability-admin.helpers.js'
import { evaluateMeshingizabilityRollout } from './meshingizability-rollout.helpers.js'
import { MeshingizabilityStatusService } from './meshingizability-status.service.js'

@Injectable()
export class MeshingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly meshingizabilityStatusService: MeshingizabilityStatusService,
  ) {}

  getCapabilities() {
    return meshingizabilityCapabilitiesResponseSchema.parse({
      supportsMeshingizabilityRollout: true,
      supportsMeshingizabilityAdminTools: true,
      supportsBillingNotificationMeshingizabilitySignals: true,
      supportsBillingWebhookMeshingizabilitySignals: true,
      guidance: getMeshingizabilityRolloutGuidance(),
    })
  }

  async getMeshingizabilityRollout() {
    const meshingizabilityTableCoverage =
      await this.meshingizabilityStatusService.getMeshingizabilityTableCoverage()

    const rollout = evaluateMeshingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.meshingizabilityStatusService.pingPostgres(),
      existingMeshingizabilityTableCount: meshingizabilityTableCoverage.existingMeshingizabilityTableCount,
      billingNotificationsTableExists: meshingizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: meshingizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: meshingizabilityTableCoverage.usageEventsTableExists,
    })

    return meshingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMeshingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMeshingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.meshingizabilityStatusService.getWorkspaceMeshingizabilityInventory(
        workspaceId,
      )
    const records = buildMeshingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.meshingizabilityStatusService.pingPostgres()
    const stats = buildMeshingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return meshingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMeshingizabilityAdminActions(),
      guidance: getMeshingizabilityAdminGuidance({ stats }),
    })
  }

  async executeMeshingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_meshingizability_summary'
    },
  ) {
    this.assertCanManageMeshingizability(authContext)

    const payload = meshingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_meshingizability_summary': {
        const summary = await this.getWorkspaceMeshingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return meshingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed meshingizability summary with ${summary.stats.meshingizabilityPercent}% billing notification meshingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMeshingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production meshingizability tools.',
    })
  }
}
