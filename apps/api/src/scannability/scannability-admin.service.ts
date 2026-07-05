import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getScannabilityRolloutGuidance,
  scannabilityAdminActionRequestSchema,
  scannabilityAdminActionResponseSchema,
  scannabilityAdminSummaryResponseSchema,
  scannabilityCapabilitiesResponseSchema,
  scannabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildScannabilityAdminRecords,
  buildScannabilityAdminStats,
  getScannabilityAdminGuidance,
  resolveScannabilityAdminActions,
} from './scannability-admin.helpers.js'
import { evaluateScannabilityRollout } from './scannability-rollout.helpers.js'
import { ScannabilityStatusService } from './scannability-status.service.js'

@Injectable()
export class ScannabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly scannabilityStatusService: ScannabilityStatusService,
  ) {}

  getCapabilities() {
    return scannabilityCapabilitiesResponseSchema.parse({
      supportsScannabilityRollout: true,
      supportsScannabilityAdminTools: true,
      supportsShieldScanScannabilitySignals: true,
      supportsProviderCredentialScannabilitySignals: true,
      guidance: getScannabilityRolloutGuidance(),
    })
  }

  async getScannabilityRollout() {
    const scannabilityTableCoverage =
      await this.scannabilityStatusService.getScannabilityTableCoverage()

    const rollout = evaluateScannabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.scannabilityStatusService.pingPostgres(),
      existingScannabilityTableCount: scannabilityTableCoverage.existingScannabilityTableCount,
      shieldScansTableExists: scannabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: scannabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: scannabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return scannabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceScannabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageScannability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.scannabilityStatusService.getWorkspaceScannabilityInventory(
        workspaceId,
      )
    const records = buildScannabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.scannabilityStatusService.pingPostgres()
    const stats = buildScannabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return scannabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveScannabilityAdminActions(),
      guidance: getScannabilityAdminGuidance({ stats }),
    })
  }

  async executeScannabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_scannability_summary'
    },
  ) {
    this.assertCanManageScannability(authContext)

    const payload = scannabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_scannability_summary': {
        const summary = await this.getWorkspaceScannabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return scannabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed scannability summary with ${summary.stats.scannabilityPercent}% shield scan scannability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageScannability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production scannability tools.',
    })
  }
}
