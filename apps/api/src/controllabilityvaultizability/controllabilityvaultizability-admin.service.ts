import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getControllabilityvaultizabilityRolloutGuidance,
  controllabilityvaultizabilityAdminActionRequestSchema,
  controllabilityvaultizabilityAdminActionResponseSchema,
  controllabilityvaultizabilityAdminSummaryResponseSchema,
  controllabilityvaultizabilityCapabilitiesResponseSchema,
  controllabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildControllabilityvaultizabilityAdminRecords,
  buildControllabilityvaultizabilityAdminStats,
  getControllabilityvaultizabilityAdminGuidance,
  resolveControllabilityvaultizabilityAdminActions,
} from './controllabilityvaultizability-admin.helpers.js'
import { evaluateControllabilityvaultizabilityRollout } from './controllabilityvaultizability-rollout.helpers.js'
import { ControllabilityvaultizabilityStatusService } from './controllabilityvaultizability-status.service.js'

@Injectable()
export class ControllabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly controllabilityvaultizabilityStatusService: ControllabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return controllabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsControllabilityvaultizabilityRollout: true,
      supportsControllabilityvaultizabilityAdminTools: true,
      supportsShieldScanControllabilityvaultizabilitySignals: true,
      supportsProviderCredentialControllabilityvaultizabilitySignals: true,
      guidance: getControllabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getControllabilityvaultizabilityRollout() {
    const controllabilityvaultizabilityTableCoverage =
      await this.controllabilityvaultizabilityStatusService.getControllabilityvaultizabilityTableCoverage()

    const rollout = evaluateControllabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.controllabilityvaultizabilityStatusService.pingPostgres(),
      existingControllabilityvaultizabilityTableCount: controllabilityvaultizabilityTableCoverage.existingControllabilityvaultizabilityTableCount,
      shieldScansTableExists: controllabilityvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: controllabilityvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: controllabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return controllabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceControllabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageControllabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.controllabilityvaultizabilityStatusService.getWorkspaceControllabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildControllabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.controllabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildControllabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return controllabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveControllabilityvaultizabilityAdminActions(),
      guidance: getControllabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeControllabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_controllabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageControllabilityvaultizability(authContext)

    const payload = controllabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_controllabilityvaultizability_summary': {
        const summary = await this.getWorkspaceControllabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return controllabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed controllabilityvaultizability summary with ${summary.stats.controllabilityvaultizabilityPercent}% shield scan controllabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageControllabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production controllabilityvaultizability tools.',
    })
  }
}
