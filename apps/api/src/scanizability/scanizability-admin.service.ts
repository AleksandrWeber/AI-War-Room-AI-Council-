import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getScanizabilityRolloutGuidance,
  scanizabilityAdminActionRequestSchema,
  scanizabilityAdminActionResponseSchema,
  scanizabilityAdminSummaryResponseSchema,
  scanizabilityCapabilitiesResponseSchema,
  scanizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildScanizabilityAdminRecords,
  buildScanizabilityAdminStats,
  getScanizabilityAdminGuidance,
  resolveScanizabilityAdminActions,
} from './scanizability-admin.helpers.js'
import { evaluateScanizabilityRollout } from './scanizability-rollout.helpers.js'
import { ScanizabilityStatusService } from './scanizability-status.service.js'

@Injectable()
export class ScanizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly scanizabilityStatusService: ScanizabilityStatusService,
  ) {}

  getCapabilities() {
    return scanizabilityCapabilitiesResponseSchema.parse({
      supportsScanizabilityRollout: true,
      supportsScanizabilityAdminTools: true,
      supportsModelHealthScanizabilitySignals: true,
      supportsModelRegistryScanizabilitySignals: true,
      guidance: getScanizabilityRolloutGuidance(),
    })
  }

  async getScanizabilityRollout() {
    const scanizabilityTableCoverage =
      await this.scanizabilityStatusService.getScanizabilityTableCoverage()

    const rollout = evaluateScanizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.scanizabilityStatusService.pingPostgres(),
      existingScanizabilityTableCount: scanizabilityTableCoverage.existingScanizabilityTableCount,
      modelHealthEventsTableExists: scanizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: scanizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: scanizabilityTableCoverage.billingRecordsTableExists,
    })

    return scanizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceScanizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageScanizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.scanizabilityStatusService.getWorkspaceScanizabilityInventory(
        workspaceId,
      )
    const records = buildScanizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.scanizabilityStatusService.pingPostgres()
    const stats = buildScanizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return scanizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveScanizabilityAdminActions(),
      guidance: getScanizabilityAdminGuidance({ stats }),
    })
  }

  async executeScanizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_scanizability_summary'
    },
  ) {
    this.assertCanManageScanizability(authContext)

    const payload = scanizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_scanizability_summary': {
        const summary = await this.getWorkspaceScanizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return scanizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed scanizability summary with ${summary.stats.scanizabilityPercent}% model health scanizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageScanizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production scanizability tools.',
    })
  }
}
