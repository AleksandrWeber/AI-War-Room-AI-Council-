import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPivotizabilityRolloutGuidance,
  pivotizabilityAdminActionRequestSchema,
  pivotizabilityAdminActionResponseSchema,
  pivotizabilityAdminSummaryResponseSchema,
  pivotizabilityCapabilitiesResponseSchema,
  pivotizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPivotizabilityAdminRecords,
  buildPivotizabilityAdminStats,
  getPivotizabilityAdminGuidance,
  resolvePivotizabilityAdminActions,
} from './pivotizability-admin.helpers.js'
import { evaluatePivotizabilityRollout } from './pivotizability-rollout.helpers.js'
import { PivotizabilityStatusService } from './pivotizability-status.service.js'

@Injectable()
export class PivotizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly pivotizabilityStatusService: PivotizabilityStatusService,
  ) {}

  getCapabilities() {
    return pivotizabilityCapabilitiesResponseSchema.parse({
      supportsPivotizabilityRollout: true,
      supportsPivotizabilityAdminTools: true,
      supportsModelHealthPivotizabilitySignals: true,
      supportsModelRegistryPivotizabilitySignals: true,
      guidance: getPivotizabilityRolloutGuidance(),
    })
  }

  async getPivotizabilityRollout() {
    const pivotizabilityTableCoverage =
      await this.pivotizabilityStatusService.getPivotizabilityTableCoverage()

    const rollout = evaluatePivotizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.pivotizabilityStatusService.pingPostgres(),
      existingPivotizabilityTableCount: pivotizabilityTableCoverage.existingPivotizabilityTableCount,
      modelHealthEventsTableExists: pivotizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: pivotizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: pivotizabilityTableCoverage.billingRecordsTableExists,
    })

    return pivotizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePivotizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePivotizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.pivotizabilityStatusService.getWorkspacePivotizabilityInventory(
        workspaceId,
      )
    const records = buildPivotizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.pivotizabilityStatusService.pingPostgres()
    const stats = buildPivotizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return pivotizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePivotizabilityAdminActions(),
      guidance: getPivotizabilityAdminGuidance({ stats }),
    })
  }

  async executePivotizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_pivotizability_summary'
    },
  ) {
    this.assertCanManagePivotizability(authContext)

    const payload = pivotizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_pivotizability_summary': {
        const summary = await this.getWorkspacePivotizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return pivotizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed pivotizability summary with ${summary.stats.pivotizabilityPercent}% model health pivotizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePivotizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production pivotizability tools.',
    })
  }
}
