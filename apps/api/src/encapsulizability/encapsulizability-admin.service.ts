import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEncapsulizabilityRolloutGuidance,
  encapsulizabilityAdminActionRequestSchema,
  encapsulizabilityAdminActionResponseSchema,
  encapsulizabilityAdminSummaryResponseSchema,
  encapsulizabilityCapabilitiesResponseSchema,
  encapsulizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEncapsulizabilityAdminRecords,
  buildEncapsulizabilityAdminStats,
  getEncapsulizabilityAdminGuidance,
  resolveEncapsulizabilityAdminActions,
} from './encapsulizability-admin.helpers.js'
import { evaluateEncapsulizabilityRollout } from './encapsulizability-rollout.helpers.js'
import { EncapsulizabilityStatusService } from './encapsulizability-status.service.js'

@Injectable()
export class EncapsulizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly encapsulizabilityStatusService: EncapsulizabilityStatusService,
  ) {}

  getCapabilities() {
    return encapsulizabilityCapabilitiesResponseSchema.parse({
      supportsEncapsulizabilityRollout: true,
      supportsEncapsulizabilityAdminTools: true,
      supportsShieldScanEncapsulizabilitySignals: true,
      supportsProviderCredentialEncapsulizabilitySignals: true,
      guidance: getEncapsulizabilityRolloutGuidance(),
    })
  }

  async getEncapsulizabilityRollout() {
    const encapsulizabilityTableCoverage =
      await this.encapsulizabilityStatusService.getEncapsulizabilityTableCoverage()

    const rollout = evaluateEncapsulizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.encapsulizabilityStatusService.pingPostgres(),
      existingEncapsulizabilityTableCount: encapsulizabilityTableCoverage.existingEncapsulizabilityTableCount,
      shieldScansTableExists: encapsulizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: encapsulizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: encapsulizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return encapsulizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEncapsulizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEncapsulizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.encapsulizabilityStatusService.getWorkspaceEncapsulizabilityInventory(
        workspaceId,
      )
    const records = buildEncapsulizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.encapsulizabilityStatusService.pingPostgres()
    const stats = buildEncapsulizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return encapsulizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEncapsulizabilityAdminActions(),
      guidance: getEncapsulizabilityAdminGuidance({ stats }),
    })
  }

  async executeEncapsulizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_encapsulizability_summary'
    },
  ) {
    this.assertCanManageEncapsulizability(authContext)

    const payload = encapsulizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_encapsulizability_summary': {
        const summary = await this.getWorkspaceEncapsulizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return encapsulizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed encapsulizability summary with ${summary.stats.encapsulizabilityPercent}% shield scan encapsulizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEncapsulizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production encapsulizability tools.',
    })
  }
}
