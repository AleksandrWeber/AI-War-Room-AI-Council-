import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDistinguishabilityvaultizabilityRolloutGuidance,
  distinguishabilityvaultizabilityAdminActionRequestSchema,
  distinguishabilityvaultizabilityAdminActionResponseSchema,
  distinguishabilityvaultizabilityAdminSummaryResponseSchema,
  distinguishabilityvaultizabilityCapabilitiesResponseSchema,
  distinguishabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDistinguishabilityvaultizabilityAdminRecords,
  buildDistinguishabilityvaultizabilityAdminStats,
  getDistinguishabilityvaultizabilityAdminGuidance,
  resolveDistinguishabilityvaultizabilityAdminActions,
} from './distinguishabilityvaultizability-admin.helpers.js'
import { evaluateDistinguishabilityvaultizabilityRollout } from './distinguishabilityvaultizability-rollout.helpers.js'
import { DistinguishabilityvaultizabilityStatusService } from './distinguishabilityvaultizability-status.service.js'

@Injectable()
export class DistinguishabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly distinguishabilityvaultizabilityStatusService: DistinguishabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return distinguishabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsDistinguishabilityvaultizabilityRollout: true,
      supportsDistinguishabilityvaultizabilityAdminTools: true,
      supportsShieldScanDistinguishabilityvaultizabilitySignals: true,
      supportsProviderCredentialDistinguishabilityvaultizabilitySignals: true,
      guidance: getDistinguishabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getDistinguishabilityvaultizabilityRollout() {
    const distinguishabilityvaultizabilityTableCoverage =
      await this.distinguishabilityvaultizabilityStatusService.getDistinguishabilityvaultizabilityTableCoverage()

    const rollout = evaluateDistinguishabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.distinguishabilityvaultizabilityStatusService.pingPostgres(),
      existingDistinguishabilityvaultizabilityTableCount: distinguishabilityvaultizabilityTableCoverage.existingDistinguishabilityvaultizabilityTableCount,
      shieldScansTableExists: distinguishabilityvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: distinguishabilityvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: distinguishabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return distinguishabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDistinguishabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDistinguishabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.distinguishabilityvaultizabilityStatusService.getWorkspaceDistinguishabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildDistinguishabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.distinguishabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildDistinguishabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return distinguishabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDistinguishabilityvaultizabilityAdminActions(),
      guidance: getDistinguishabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeDistinguishabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_distinguishabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageDistinguishabilityvaultizability(authContext)

    const payload = distinguishabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_distinguishabilityvaultizability_summary': {
        const summary = await this.getWorkspaceDistinguishabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return distinguishabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed distinguishabilityvaultizability summary with ${summary.stats.distinguishabilityvaultizabilityPercent}% shield scan distinguishabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDistinguishabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production distinguishabilityvaultizability tools.',
    })
  }
}
