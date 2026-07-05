import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMeshabilizabilityRolloutGuidance,
  meshabilizabilityAdminActionRequestSchema,
  meshabilizabilityAdminActionResponseSchema,
  meshabilizabilityAdminSummaryResponseSchema,
  meshabilizabilityCapabilitiesResponseSchema,
  meshabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMeshabilizabilityAdminRecords,
  buildMeshabilizabilityAdminStats,
  getMeshabilizabilityAdminGuidance,
  resolveMeshabilizabilityAdminActions,
} from './meshabilizability-admin.helpers.js'
import { evaluateMeshabilizabilityRollout } from './meshabilizability-rollout.helpers.js'
import { MeshabilizabilityStatusService } from './meshabilizability-status.service.js'

@Injectable()
export class MeshabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly meshabilizabilityStatusService: MeshabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return meshabilizabilityCapabilitiesResponseSchema.parse({
      supportsMeshabilizabilityRollout: true,
      supportsMeshabilizabilityAdminTools: true,
      supportsModelHealthMeshabilizabilitySignals: true,
      supportsModelRegistryMeshabilizabilitySignals: true,
      guidance: getMeshabilizabilityRolloutGuidance(),
    })
  }

  async getMeshabilizabilityRollout() {
    const meshabilizabilityTableCoverage =
      await this.meshabilizabilityStatusService.getMeshabilizabilityTableCoverage()

    const rollout = evaluateMeshabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.meshabilizabilityStatusService.pingPostgres(),
      existingMeshabilizabilityTableCount: meshabilizabilityTableCoverage.existingMeshabilizabilityTableCount,
      modelHealthEventsTableExists: meshabilizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: meshabilizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: meshabilizabilityTableCoverage.billingRecordsTableExists,
    })

    return meshabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMeshabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMeshabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.meshabilizabilityStatusService.getWorkspaceMeshabilizabilityInventory(
        workspaceId,
      )
    const records = buildMeshabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.meshabilizabilityStatusService.pingPostgres()
    const stats = buildMeshabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return meshabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMeshabilizabilityAdminActions(),
      guidance: getMeshabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeMeshabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_meshabilizability_summary'
    },
  ) {
    this.assertCanManageMeshabilizability(authContext)

    const payload = meshabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_meshabilizability_summary': {
        const summary = await this.getWorkspaceMeshabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return meshabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed meshabilizability summary with ${summary.stats.meshabilizabilityPercent}% model health meshabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMeshabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production meshabilizability tools.',
    })
  }
}
