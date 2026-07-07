import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getExtensibilityvaultizabilityRolloutGuidance,
  extensibilityvaultizabilityAdminActionRequestSchema,
  extensibilityvaultizabilityAdminActionResponseSchema,
  extensibilityvaultizabilityAdminSummaryResponseSchema,
  extensibilityvaultizabilityCapabilitiesResponseSchema,
  extensibilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildExtensibilityvaultizabilityAdminRecords,
  buildExtensibilityvaultizabilityAdminStats,
  getExtensibilityvaultizabilityAdminGuidance,
  resolveExtensibilityvaultizabilityAdminActions,
} from './extensibilityvaultizability-admin.helpers.js'
import { evaluateExtensibilityvaultizabilityRollout } from './extensibilityvaultizability-rollout.helpers.js'
import { ExtensibilityvaultizabilityStatusService } from './extensibilityvaultizability-status.service.js'

@Injectable()
export class ExtensibilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly extensibilityvaultizabilityStatusService: ExtensibilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return extensibilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsExtensibilityvaultizabilityRollout: true,
      supportsExtensibilityvaultizabilityAdminTools: true,
      supportsShieldScanExtensibilityvaultizabilitySignals: true,
      supportsProviderCredentialExtensibilityvaultizabilitySignals: true,
      guidance: getExtensibilityvaultizabilityRolloutGuidance(),
    })
  }

  async getExtensibilityvaultizabilityRollout() {
    const extensibilityvaultizabilityTableCoverage =
      await this.extensibilityvaultizabilityStatusService.getExtensibilityvaultizabilityTableCoverage()

    const rollout = evaluateExtensibilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.extensibilityvaultizabilityStatusService.pingPostgres(),
      existingExtensibilityvaultizabilityTableCount: extensibilityvaultizabilityTableCoverage.existingExtensibilityvaultizabilityTableCount,
      shieldScansTableExists: extensibilityvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: extensibilityvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: extensibilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return extensibilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceExtensibilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageExtensibilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.extensibilityvaultizabilityStatusService.getWorkspaceExtensibilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildExtensibilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.extensibilityvaultizabilityStatusService.pingPostgres()
    const stats = buildExtensibilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return extensibilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveExtensibilityvaultizabilityAdminActions(),
      guidance: getExtensibilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeExtensibilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_extensibilityvaultizability_summary'
    },
  ) {
    this.assertCanManageExtensibilityvaultizability(authContext)

    const payload = extensibilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_extensibilityvaultizability_summary': {
        const summary = await this.getWorkspaceExtensibilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return extensibilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed extensibilityvaultizability summary with ${summary.stats.extensibilityvaultizabilityPercent}% shield scan extensibilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageExtensibilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production extensibilityvaultizability tools.',
    })
  }
}
