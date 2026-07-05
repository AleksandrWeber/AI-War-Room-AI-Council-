import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBackupizabilityRolloutGuidance,
  backupizabilityAdminActionRequestSchema,
  backupizabilityAdminActionResponseSchema,
  backupizabilityAdminSummaryResponseSchema,
  backupizabilityCapabilitiesResponseSchema,
  backupizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBackupizabilityAdminRecords,
  buildBackupizabilityAdminStats,
  getBackupizabilityAdminGuidance,
  resolveBackupizabilityAdminActions,
} from './backupizability-admin.helpers.js'
import { evaluateBackupizabilityRollout } from './backupizability-rollout.helpers.js'
import { BackupizabilityStatusService } from './backupizability-status.service.js'

@Injectable()
export class BackupizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly backupizabilityStatusService: BackupizabilityStatusService,
  ) {}

  getCapabilities() {
    return backupizabilityCapabilitiesResponseSchema.parse({
      supportsBackupizabilityRollout: true,
      supportsBackupizabilityAdminTools: true,
      supportsMeterUsageBackupizabilitySignals: true,
      supportsUsageEventBackupizabilitySignals: true,
      guidance: getBackupizabilityRolloutGuidance(),
    })
  }

  async getBackupizabilityRollout() {
    const backupizabilityTableCoverage =
      await this.backupizabilityStatusService.getBackupizabilityTableCoverage()

    const rollout = evaluateBackupizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.backupizabilityStatusService.pingPostgres(),
      existingBackupizabilityTableCount: backupizabilityTableCoverage.existingBackupizabilityTableCount,
      billingMeterUsageReportsTableExists: backupizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: backupizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: backupizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return backupizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBackupizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBackupizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.backupizabilityStatusService.getWorkspaceBackupizabilityInventory(
        workspaceId,
      )
    const records = buildBackupizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.backupizabilityStatusService.pingPostgres()
    const stats = buildBackupizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return backupizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBackupizabilityAdminActions(),
      guidance: getBackupizabilityAdminGuidance({ stats }),
    })
  }

  async executeBackupizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_backupizability_summary'
    },
  ) {
    this.assertCanManageBackupizability(authContext)

    const payload = backupizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_backupizability_summary': {
        const summary = await this.getWorkspaceBackupizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return backupizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed backupizability summary with ${summary.stats.backupizabilityPercent}% meter usage backupizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBackupizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production backupizability tools.',
    })
  }
}
