import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getGlossarizabilityRolloutGuidance,
  glossarizabilityAdminActionRequestSchema,
  glossarizabilityAdminActionResponseSchema,
  glossarizabilityAdminSummaryResponseSchema,
  glossarizabilityCapabilitiesResponseSchema,
  glossarizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildGlossarizabilityAdminRecords,
  buildGlossarizabilityAdminStats,
  getGlossarizabilityAdminGuidance,
  resolveGlossarizabilityAdminActions,
} from './glossarizability-admin.helpers.js'
import { evaluateGlossarizabilityRollout } from './glossarizability-rollout.helpers.js'
import { GlossarizabilityStatusService } from './glossarizability-status.service.js'

@Injectable()
export class GlossarizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly glossarizabilityStatusService: GlossarizabilityStatusService,
  ) {}

  getCapabilities() {
    return glossarizabilityCapabilitiesResponseSchema.parse({
      supportsGlossarizabilityRollout: true,
      supportsGlossarizabilityAdminTools: true,
      supportsShieldScanGlossarizabilitySignals: true,
      supportsProviderCredentialGlossarizabilitySignals: true,
      guidance: getGlossarizabilityRolloutGuidance(),
    })
  }

  async getGlossarizabilityRollout() {
    const glossarizabilityTableCoverage =
      await this.glossarizabilityStatusService.getGlossarizabilityTableCoverage()

    const rollout = evaluateGlossarizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.glossarizabilityStatusService.pingPostgres(),
      existingGlossarizabilityTableCount: glossarizabilityTableCoverage.existingGlossarizabilityTableCount,
      shieldScansTableExists: glossarizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: glossarizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: glossarizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return glossarizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceGlossarizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageGlossarizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.glossarizabilityStatusService.getWorkspaceGlossarizabilityInventory(
        workspaceId,
      )
    const records = buildGlossarizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.glossarizabilityStatusService.pingPostgres()
    const stats = buildGlossarizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return glossarizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveGlossarizabilityAdminActions(),
      guidance: getGlossarizabilityAdminGuidance({ stats }),
    })
  }

  async executeGlossarizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_glossarizability_summary'
    },
  ) {
    this.assertCanManageGlossarizability(authContext)

    const payload = glossarizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_glossarizability_summary': {
        const summary = await this.getWorkspaceGlossarizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return glossarizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed glossarizability summary with ${summary.stats.glossarizabilityPercent}% shield scan glossarizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageGlossarizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production glossarizability tools.',
    })
  }
}
