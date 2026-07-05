import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getWarrantabilityRolloutGuidance,
  warrantabilityAdminActionRequestSchema,
  warrantabilityAdminActionResponseSchema,
  warrantabilityAdminSummaryResponseSchema,
  warrantabilityCapabilitiesResponseSchema,
  warrantabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildWarrantabilityAdminRecords,
  buildWarrantabilityAdminStats,
  getWarrantabilityAdminGuidance,
  resolveWarrantabilityAdminActions,
} from './warrantability-admin.helpers.js'
import { evaluateWarrantabilityRollout } from './warrantability-rollout.helpers.js'
import { WarrantabilityStatusService } from './warrantability-status.service.js'

@Injectable()
export class WarrantabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly warrantabilityStatusService: WarrantabilityStatusService,
  ) {}

  getCapabilities() {
    return warrantabilityCapabilitiesResponseSchema.parse({
      supportsWarrantabilityRollout: true,
      supportsWarrantabilityAdminTools: true,
      supportsShieldScanWarrantabilitySignals: true,
      supportsArtifactWarrantabilitySignals: true,
      guidance: getWarrantabilityRolloutGuidance(),
    })
  }

  async getWarrantabilityRollout() {
    const warrantabilityTableCoverage =
      await this.warrantabilityStatusService.getWarrantabilityTableCoverage()

    const rollout = evaluateWarrantabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.warrantabilityStatusService.pingPostgres(),
      existingWarrantabilityTableCount: warrantabilityTableCoverage.existingWarrantabilityTableCount,
      shieldScansTableExists: warrantabilityTableCoverage.shieldScansTableExists,
      artifactsTableExists: warrantabilityTableCoverage.artifactsTableExists,
      runWorkflowsTableExists: warrantabilityTableCoverage.runWorkflowsTableExists,
    })

    return warrantabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceWarrantabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageWarrantability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.warrantabilityStatusService.getWorkspaceWarrantabilityInventory(
        workspaceId,
      )
    const records = buildWarrantabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.warrantabilityStatusService.pingPostgres()
    const stats = buildWarrantabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return warrantabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveWarrantabilityAdminActions(),
      guidance: getWarrantabilityAdminGuidance({ stats }),
    })
  }

  async executeWarrantabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_warrantability_summary'
    },
  ) {
    this.assertCanManageWarrantability(authContext)

    const payload = warrantabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_warrantability_summary': {
        const summary = await this.getWorkspaceWarrantabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return warrantabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed warrantability summary with ${summary.stats.warrantabilityPercent}% shield scan warrantability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageWarrantability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production warrantability tools.',
    })
  }
}
