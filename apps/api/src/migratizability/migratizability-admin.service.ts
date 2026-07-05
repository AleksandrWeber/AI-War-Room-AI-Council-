import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMigratizabilityRolloutGuidance,
  migratizabilityAdminActionRequestSchema,
  migratizabilityAdminActionResponseSchema,
  migratizabilityAdminSummaryResponseSchema,
  migratizabilityCapabilitiesResponseSchema,
  migratizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMigratizabilityAdminRecords,
  buildMigratizabilityAdminStats,
  getMigratizabilityAdminGuidance,
  resolveMigratizabilityAdminActions,
} from './migratizability-admin.helpers.js'
import { evaluateMigratizabilityRollout } from './migratizability-rollout.helpers.js'
import { MigratizabilityStatusService } from './migratizability-status.service.js'

@Injectable()
export class MigratizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly migratizabilityStatusService: MigratizabilityStatusService,
  ) {}

  getCapabilities() {
    return migratizabilityCapabilitiesResponseSchema.parse({
      supportsMigratizabilityRollout: true,
      supportsMigratizabilityAdminTools: true,
      supportsWorkspaceLimitMigratizabilitySignals: true,
      supportsUsageEventMigratizabilitySignals: true,
      guidance: getMigratizabilityRolloutGuidance(),
    })
  }

  async getMigratizabilityRollout() {
    const migratizabilityTableCoverage =
      await this.migratizabilityStatusService.getMigratizabilityTableCoverage()

    const rollout = evaluateMigratizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.migratizabilityStatusService.pingPostgres(),
      existingMigratizabilityTableCount: migratizabilityTableCoverage.existingMigratizabilityTableCount,
      workspaceUsageLimitsTableExists: migratizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: migratizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: migratizabilityTableCoverage.billingRecordsTableExists,
    })

    return migratizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMigratizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMigratizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.migratizabilityStatusService.getWorkspaceMigratizabilityInventory(
        workspaceId,
      )
    const records = buildMigratizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.migratizabilityStatusService.pingPostgres()
    const stats = buildMigratizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return migratizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMigratizabilityAdminActions(),
      guidance: getMigratizabilityAdminGuidance({ stats }),
    })
  }

  async executeMigratizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_migratizability_summary'
    },
  ) {
    this.assertCanManageMigratizability(authContext)

    const payload = migratizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_migratizability_summary': {
        const summary = await this.getWorkspaceMigratizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return migratizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed migratizability summary with ${summary.stats.migratizabilityPercent}% workspace limit migratizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMigratizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production migratizability tools.',
    })
  }
}
