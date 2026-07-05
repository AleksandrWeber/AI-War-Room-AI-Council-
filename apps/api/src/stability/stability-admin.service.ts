import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getStabilityRolloutGuidance,
  stabilityAdminActionRequestSchema,
  stabilityAdminActionResponseSchema,
  stabilityAdminSummaryResponseSchema,
  stabilityCapabilitiesResponseSchema,
  stabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { MigrationStatusService } from '../migrations/migration-status.service.js'
import {
  buildStabilityAdminRecords,
  buildStabilityAdminStats,
  getStabilityAdminGuidance,
  resolveStabilityAdminActions,
} from './stability-admin.helpers.js'
import { evaluateStabilityRollout } from './stability-rollout.helpers.js'
import { StabilityStatusService } from './stability-status.service.js'

@Injectable()
export class StabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly stabilityStatusService: StabilityStatusService,
    private readonly migrationStatusService: MigrationStatusService,
  ) {}

  getCapabilities() {
    return stabilityCapabilitiesResponseSchema.parse({
      supportsStabilityRollout: true,
      supportsStabilityAdminTools: true,
      supportsArtifactPersistenceSignals: true,
      supportsSchemaMigrationStability: true,
      guidance: getStabilityRolloutGuidance(),
    })
  }

  async getStabilityRollout() {
    const stabilityTableCoverage =
      await this.stabilityStatusService.getStabilityTableCoverage()
    const migrationInventory =
      await this.migrationStatusService.getMigrationInventory()

    const rollout = evaluateStabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.stabilityStatusService.pingPostgres(),
      existingStabilityTableCount:
        stabilityTableCoverage.existingStabilityTableCount,
      pendingMigrationCount: migrationInventory.pendingVersions.length,
      artifactsTableExists: stabilityTableCoverage.artifactsTableExists,
    })

    return stabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceStabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageStability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.stabilityStatusService.getWorkspaceStabilityInventory(
        workspaceId,
      )
    const records = buildStabilityAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.stabilityStatusService.pingPostgres()
    const stats = buildStabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return stabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveStabilityAdminActions(),
      guidance: getStabilityAdminGuidance({ stats }),
    })
  }

  async executeStabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_stability_summary'
    },
  ) {
    this.assertCanManageStability(authContext)

    const payload = stabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_stability_summary': {
        const summary = await this.getWorkspaceStabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return stabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed stability summary with ${summary.stats.stabilityPercent}% run stability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageStability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production stability tools.',
    })
  }
}
