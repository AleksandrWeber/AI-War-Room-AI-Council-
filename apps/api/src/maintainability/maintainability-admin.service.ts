import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMaintainabilityRolloutGuidance,
  maintainabilityAdminActionRequestSchema,
  maintainabilityAdminActionResponseSchema,
  maintainabilityAdminSummaryResponseSchema,
  maintainabilityCapabilitiesResponseSchema,
  maintainabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { HealthService } from '../health/health.service.js'
import { MigrationStatusService } from '../migrations/migration-status.service.js'
import {
  buildMaintainabilityAdminRecords,
  buildMaintainabilityAdminStats,
  getMaintainabilityAdminGuidance,
  resolveMaintainabilityAdminActions,
} from './maintainability-admin.helpers.js'
import { evaluateMaintainabilityRollout } from './maintainability-rollout.helpers.js'
import { MaintainabilityStatusService } from './maintainability-status.service.js'

@Injectable()
export class MaintainabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly maintainabilityStatusService: MaintainabilityStatusService,
    private readonly migrationStatusService: MigrationStatusService,
    private readonly healthService: HealthService,
  ) {}

  getCapabilities() {
    return maintainabilityCapabilitiesResponseSchema.parse({
      supportsMaintainabilityRollout: true,
      supportsMaintainabilityAdminTools: true,
      supportsMigrationOperabilitySignals: true,
      supportsModelHealthMaintainabilitySignals: true,
      guidance: getMaintainabilityRolloutGuidance(),
    })
  }

  async getMaintainabilityRollout() {
    const maintainabilityTableCoverage =
      await this.maintainabilityStatusService.getMaintainabilityTableCoverage()
    const migrationInventory =
      await this.migrationStatusService.getMigrationInventory()

    const rollout = evaluateMaintainabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity:
        await this.maintainabilityStatusService.pingPostgres(),
      existingMaintainabilityTableCount:
        maintainabilityTableCoverage.existingMaintainabilityTableCount,
      pendingMigrationCount: migrationInventory.pendingVersions.length,
      modelHealthEventTableExists:
        maintainabilityTableCoverage.modelHealthEventTableExists,
      apiHealthStatusOk: this.healthService.getStatus().status === 'ok',
    })

    return maintainabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMaintainabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMaintainability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.maintainabilityStatusService.getWorkspaceMaintainabilityInventory(
        workspaceId,
      )
    const records = buildMaintainabilityAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.maintainabilityStatusService.pingPostgres()
    const stats = buildMaintainabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return maintainabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMaintainabilityAdminActions(),
      guidance: getMaintainabilityAdminGuidance({ stats }),
    })
  }

  async executeMaintainabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_maintainability_summary'
    },
  ) {
    this.assertCanManageMaintainability(authContext)

    const payload = maintainabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_maintainability_summary': {
        const summary = await this.getWorkspaceMaintainabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return maintainabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed maintainability summary with ${summary.stats.maintainabilityPercent}% run maintainability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMaintainability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production maintainability tools.',
    })
  }
}
