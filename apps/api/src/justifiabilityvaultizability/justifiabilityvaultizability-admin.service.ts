import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getJustifiabilityvaultizabilityRolloutGuidance,
  justifiabilityvaultizabilityAdminActionRequestSchema,
  justifiabilityvaultizabilityAdminActionResponseSchema,
  justifiabilityvaultizabilityAdminSummaryResponseSchema,
  justifiabilityvaultizabilityCapabilitiesResponseSchema,
  justifiabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildJustifiabilityvaultizabilityAdminRecords,
  buildJustifiabilityvaultizabilityAdminStats,
  getJustifiabilityvaultizabilityAdminGuidance,
  resolveJustifiabilityvaultizabilityAdminActions,
} from './justifiabilityvaultizability-admin.helpers.js'
import { evaluateJustifiabilityvaultizabilityRollout } from './justifiabilityvaultizability-rollout.helpers.js'
import { JustifiabilityvaultizabilityStatusService } from './justifiabilityvaultizability-status.service.js'

@Injectable()
export class JustifiabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly justifiabilityvaultizabilityStatusService: JustifiabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return justifiabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsJustifiabilityvaultizabilityRollout: true,
      supportsJustifiabilityvaultizabilityAdminTools: true,
      supportsShieldScanJustifiabilityvaultizabilitySignals: true,
      supportsProviderCredentialJustifiabilityvaultizabilitySignals: true,
      guidance: getJustifiabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getJustifiabilityvaultizabilityRollout() {
    const justifiabilityvaultizabilityTableCoverage =
      await this.justifiabilityvaultizabilityStatusService.getJustifiabilityvaultizabilityTableCoverage()

    const rollout = evaluateJustifiabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.justifiabilityvaultizabilityStatusService.pingPostgres(),
      existingJustifiabilityvaultizabilityTableCount: justifiabilityvaultizabilityTableCoverage.existingJustifiabilityvaultizabilityTableCount,
      shieldScansTableExists: justifiabilityvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: justifiabilityvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: justifiabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return justifiabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceJustifiabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageJustifiabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.justifiabilityvaultizabilityStatusService.getWorkspaceJustifiabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildJustifiabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.justifiabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildJustifiabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return justifiabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveJustifiabilityvaultizabilityAdminActions(),
      guidance: getJustifiabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeJustifiabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_justifiabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageJustifiabilityvaultizability(authContext)

    const payload = justifiabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_justifiabilityvaultizability_summary': {
        const summary = await this.getWorkspaceJustifiabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return justifiabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed justifiabilityvaultizability summary with ${summary.stats.justifiabilityvaultizabilityPercent}% shield scan justifiabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageJustifiabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production justifiabilityvaultizability tools.',
    })
  }
}
