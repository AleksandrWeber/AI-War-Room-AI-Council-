import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuthenticationizabilityRolloutGuidance,
  authenticationizabilityAdminActionRequestSchema,
  authenticationizabilityAdminActionResponseSchema,
  authenticationizabilityAdminSummaryResponseSchema,
  authenticationizabilityCapabilitiesResponseSchema,
  authenticationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuthenticationizabilityAdminRecords,
  buildAuthenticationizabilityAdminStats,
  getAuthenticationizabilityAdminGuidance,
  resolveAuthenticationizabilityAdminActions,
} from './authenticationizability-admin.helpers.js'
import { evaluateAuthenticationizabilityRollout } from './authenticationizability-rollout.helpers.js'
import { AuthenticationizabilityStatusService } from './authenticationizability-status.service.js'

@Injectable()
export class AuthenticationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly authenticationizabilityStatusService: AuthenticationizabilityStatusService,
  ) {}

  getCapabilities() {
    return authenticationizabilityCapabilitiesResponseSchema.parse({
      supportsAuthenticationizabilityRollout: true,
      supportsAuthenticationizabilityAdminTools: true,
      supportsShieldScanAuthenticationizabilitySignals: true,
      supportsProviderCredentialAuthenticationizabilitySignals: true,
      guidance: getAuthenticationizabilityRolloutGuidance(),
    })
  }

  async getAuthenticationizabilityRollout() {
    const authenticationizabilityTableCoverage =
      await this.authenticationizabilityStatusService.getAuthenticationizabilityTableCoverage()

    const rollout = evaluateAuthenticationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.authenticationizabilityStatusService.pingPostgres(),
      existingAuthenticationizabilityTableCount: authenticationizabilityTableCoverage.existingAuthenticationizabilityTableCount,
      shieldScansTableExists: authenticationizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: authenticationizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: authenticationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return authenticationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuthenticationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuthenticationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.authenticationizabilityStatusService.getWorkspaceAuthenticationizabilityInventory(
        workspaceId,
      )
    const records = buildAuthenticationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.authenticationizabilityStatusService.pingPostgres()
    const stats = buildAuthenticationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return authenticationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuthenticationizabilityAdminActions(),
      guidance: getAuthenticationizabilityAdminGuidance({ stats }),
    })
  }

  async executeAuthenticationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_authenticationizability_summary'
    },
  ) {
    this.assertCanManageAuthenticationizability(authContext)

    const payload = authenticationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_authenticationizability_summary': {
        const summary = await this.getWorkspaceAuthenticationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return authenticationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed authenticationizability summary with ${summary.stats.authenticationizabilityPercent}% shield scan authenticationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuthenticationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production authenticationizability tools.',
    })
  }
}
