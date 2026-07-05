import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCalibratizabilityRolloutGuidance,
  calibratizabilityAdminActionRequestSchema,
  calibratizabilityAdminActionResponseSchema,
  calibratizabilityAdminSummaryResponseSchema,
  calibratizabilityCapabilitiesResponseSchema,
  calibratizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCalibratizabilityAdminRecords,
  buildCalibratizabilityAdminStats,
  getCalibratizabilityAdminGuidance,
  resolveCalibratizabilityAdminActions,
} from './calibratizability-admin.helpers.js'
import { evaluateCalibratizabilityRollout } from './calibratizability-rollout.helpers.js'
import { CalibratizabilityStatusService } from './calibratizability-status.service.js'

@Injectable()
export class CalibratizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly calibratizabilityStatusService: CalibratizabilityStatusService,
  ) {}

  getCapabilities() {
    return calibratizabilityCapabilitiesResponseSchema.parse({
      supportsCalibratizabilityRollout: true,
      supportsCalibratizabilityAdminTools: true,
      supportsShieldScanCalibratizabilitySignals: true,
      supportsProviderCredentialCalibratizabilitySignals: true,
      guidance: getCalibratizabilityRolloutGuidance(),
    })
  }

  async getCalibratizabilityRollout() {
    const calibratizabilityTableCoverage =
      await this.calibratizabilityStatusService.getCalibratizabilityTableCoverage()

    const rollout = evaluateCalibratizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.calibratizabilityStatusService.pingPostgres(),
      existingCalibratizabilityTableCount: calibratizabilityTableCoverage.existingCalibratizabilityTableCount,
      shieldScansTableExists: calibratizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: calibratizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: calibratizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return calibratizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCalibratizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCalibratizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.calibratizabilityStatusService.getWorkspaceCalibratizabilityInventory(
        workspaceId,
      )
    const records = buildCalibratizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.calibratizabilityStatusService.pingPostgres()
    const stats = buildCalibratizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return calibratizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCalibratizabilityAdminActions(),
      guidance: getCalibratizabilityAdminGuidance({ stats }),
    })
  }

  async executeCalibratizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_calibratizability_summary'
    },
  ) {
    this.assertCanManageCalibratizability(authContext)

    const payload = calibratizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_calibratizability_summary': {
        const summary = await this.getWorkspaceCalibratizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return calibratizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed calibratizability summary with ${summary.stats.calibratizabilityPercent}% shield scan calibratizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCalibratizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production calibratizability tools.',
    })
  }
}
