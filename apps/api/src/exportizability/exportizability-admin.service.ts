import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getExportizabilityRolloutGuidance,
  exportizabilityAdminActionRequestSchema,
  exportizabilityAdminActionResponseSchema,
  exportizabilityAdminSummaryResponseSchema,
  exportizabilityCapabilitiesResponseSchema,
  exportizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildExportizabilityAdminRecords,
  buildExportizabilityAdminStats,
  getExportizabilityAdminGuidance,
  resolveExportizabilityAdminActions,
} from './exportizability-admin.helpers.js'
import { evaluateExportizabilityRollout } from './exportizability-rollout.helpers.js'
import { ExportizabilityStatusService } from './exportizability-status.service.js'

@Injectable()
export class ExportizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly exportizabilityStatusService: ExportizabilityStatusService,
  ) {}

  getCapabilities() {
    return exportizabilityCapabilitiesResponseSchema.parse({
      supportsExportizabilityRollout: true,
      supportsExportizabilityAdminTools: true,
      supportsWorkspaceLimitExportizabilitySignals: true,
      supportsUsageEventExportizabilitySignals: true,
      guidance: getExportizabilityRolloutGuidance(),
    })
  }

  async getExportizabilityRollout() {
    const exportizabilityTableCoverage =
      await this.exportizabilityStatusService.getExportizabilityTableCoverage()

    const rollout = evaluateExportizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.exportizabilityStatusService.pingPostgres(),
      existingExportizabilityTableCount: exportizabilityTableCoverage.existingExportizabilityTableCount,
      workspaceUsageLimitsTableExists: exportizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: exportizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: exportizabilityTableCoverage.billingRecordsTableExists,
    })

    return exportizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceExportizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageExportizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.exportizabilityStatusService.getWorkspaceExportizabilityInventory(
        workspaceId,
      )
    const records = buildExportizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.exportizabilityStatusService.pingPostgres()
    const stats = buildExportizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return exportizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveExportizabilityAdminActions(),
      guidance: getExportizabilityAdminGuidance({ stats }),
    })
  }

  async executeExportizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_exportizability_summary'
    },
  ) {
    this.assertCanManageExportizability(authContext)

    const payload = exportizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_exportizability_summary': {
        const summary = await this.getWorkspaceExportizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return exportizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed exportizability summary with ${summary.stats.exportizabilityPercent}% workspace limit exportizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageExportizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production exportizability tools.',
    })
  }
}
