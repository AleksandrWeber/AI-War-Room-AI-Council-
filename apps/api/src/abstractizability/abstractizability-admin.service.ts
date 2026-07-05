import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAbstractizabilityRolloutGuidance,
  abstractizabilityAdminActionRequestSchema,
  abstractizabilityAdminActionResponseSchema,
  abstractizabilityAdminSummaryResponseSchema,
  abstractizabilityCapabilitiesResponseSchema,
  abstractizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAbstractizabilityAdminRecords,
  buildAbstractizabilityAdminStats,
  getAbstractizabilityAdminGuidance,
  resolveAbstractizabilityAdminActions,
} from './abstractizability-admin.helpers.js'
import { evaluateAbstractizabilityRollout } from './abstractizability-rollout.helpers.js'
import { AbstractizabilityStatusService } from './abstractizability-status.service.js'

@Injectable()
export class AbstractizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly abstractizabilityStatusService: AbstractizabilityStatusService,
  ) {}

  getCapabilities() {
    return abstractizabilityCapabilitiesResponseSchema.parse({
      supportsAbstractizabilityRollout: true,
      supportsAbstractizabilityAdminTools: true,
      supportsShieldScanAbstractizabilitySignals: true,
      supportsProviderCredentialAbstractizabilitySignals: true,
      guidance: getAbstractizabilityRolloutGuidance(),
    })
  }

  async getAbstractizabilityRollout() {
    const abstractizabilityTableCoverage =
      await this.abstractizabilityStatusService.getAbstractizabilityTableCoverage()

    const rollout = evaluateAbstractizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.abstractizabilityStatusService.pingPostgres(),
      existingAbstractizabilityTableCount: abstractizabilityTableCoverage.existingAbstractizabilityTableCount,
      shieldScansTableExists: abstractizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: abstractizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: abstractizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return abstractizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAbstractizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAbstractizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.abstractizabilityStatusService.getWorkspaceAbstractizabilityInventory(
        workspaceId,
      )
    const records = buildAbstractizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.abstractizabilityStatusService.pingPostgres()
    const stats = buildAbstractizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return abstractizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAbstractizabilityAdminActions(),
      guidance: getAbstractizabilityAdminGuidance({ stats }),
    })
  }

  async executeAbstractizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_abstractizability_summary'
    },
  ) {
    this.assertCanManageAbstractizability(authContext)

    const payload = abstractizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_abstractizability_summary': {
        const summary = await this.getWorkspaceAbstractizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return abstractizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed abstractizability summary with ${summary.stats.abstractizabilityPercent}% shield scan abstractizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAbstractizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production abstractizability tools.',
    })
  }
}
