import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getScriptabilizabilityRolloutGuidance,
  scriptabilizabilityAdminActionRequestSchema,
  scriptabilizabilityAdminActionResponseSchema,
  scriptabilizabilityAdminSummaryResponseSchema,
  scriptabilizabilityCapabilitiesResponseSchema,
  scriptabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildScriptabilizabilityAdminRecords,
  buildScriptabilizabilityAdminStats,
  getScriptabilizabilityAdminGuidance,
  resolveScriptabilizabilityAdminActions,
} from './scriptabilizability-admin.helpers.js'
import { evaluateScriptabilizabilityRollout } from './scriptabilizability-rollout.helpers.js'
import { ScriptabilizabilityStatusService } from './scriptabilizability-status.service.js'

@Injectable()
export class ScriptabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly scriptabilizabilityStatusService: ScriptabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return scriptabilizabilityCapabilitiesResponseSchema.parse({
      supportsScriptabilizabilityRollout: true,
      supportsScriptabilizabilityAdminTools: true,
      supportsShieldScanScriptabilizabilitySignals: true,
      supportsProviderCredentialScriptabilizabilitySignals: true,
      guidance: getScriptabilizabilityRolloutGuidance(),
    })
  }

  async getScriptabilizabilityRollout() {
    const scriptabilizabilityTableCoverage =
      await this.scriptabilizabilityStatusService.getScriptabilizabilityTableCoverage()

    const rollout = evaluateScriptabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.scriptabilizabilityStatusService.pingPostgres(),
      existingScriptabilizabilityTableCount: scriptabilizabilityTableCoverage.existingScriptabilizabilityTableCount,
      shieldScansTableExists: scriptabilizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: scriptabilizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: scriptabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return scriptabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceScriptabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageScriptabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.scriptabilizabilityStatusService.getWorkspaceScriptabilizabilityInventory(
        workspaceId,
      )
    const records = buildScriptabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.scriptabilizabilityStatusService.pingPostgres()
    const stats = buildScriptabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return scriptabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveScriptabilizabilityAdminActions(),
      guidance: getScriptabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeScriptabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_scriptabilizability_summary'
    },
  ) {
    this.assertCanManageScriptabilizability(authContext)

    const payload = scriptabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_scriptabilizability_summary': {
        const summary = await this.getWorkspaceScriptabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return scriptabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed scriptabilizability summary with ${summary.stats.scriptabilizabilityPercent}% shield scan scriptabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageScriptabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production scriptabilizability tools.',
    })
  }
}
