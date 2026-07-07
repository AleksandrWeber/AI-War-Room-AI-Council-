import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInstrumentationizabilityRolloutGuidance,
  instrumentationizabilityAdminActionRequestSchema,
  instrumentationizabilityAdminActionResponseSchema,
  instrumentationizabilityAdminSummaryResponseSchema,
  instrumentationizabilityCapabilitiesResponseSchema,
  instrumentationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInstrumentationizabilityAdminRecords,
  buildInstrumentationizabilityAdminStats,
  getInstrumentationizabilityAdminGuidance,
  resolveInstrumentationizabilityAdminActions,
} from './instrumentationizability-admin.helpers.js'
import { evaluateInstrumentationizabilityRollout } from './instrumentationizability-rollout.helpers.js'
import { InstrumentationizabilityStatusService } from './instrumentationizability-status.service.js'

@Injectable()
export class InstrumentationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly instrumentationizabilityStatusService: InstrumentationizabilityStatusService,
  ) {}

  getCapabilities() {
    return instrumentationizabilityCapabilitiesResponseSchema.parse({
      supportsInstrumentationizabilityRollout: true,
      supportsInstrumentationizabilityAdminTools: true,
      supportsShieldScanInstrumentationizabilitySignals: true,
      supportsProviderCredentialInstrumentationizabilitySignals: true,
      guidance: getInstrumentationizabilityRolloutGuidance(),
    })
  }

  async getInstrumentationizabilityRollout() {
    const instrumentationizabilityTableCoverage =
      await this.instrumentationizabilityStatusService.getInstrumentationizabilityTableCoverage()

    const rollout = evaluateInstrumentationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.instrumentationizabilityStatusService.pingPostgres(),
      existingInstrumentationizabilityTableCount: instrumentationizabilityTableCoverage.existingInstrumentationizabilityTableCount,
      shieldScansTableExists: instrumentationizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: instrumentationizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: instrumentationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return instrumentationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInstrumentationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInstrumentationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.instrumentationizabilityStatusService.getWorkspaceInstrumentationizabilityInventory(
        workspaceId,
      )
    const records = buildInstrumentationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.instrumentationizabilityStatusService.pingPostgres()
    const stats = buildInstrumentationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return instrumentationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInstrumentationizabilityAdminActions(),
      guidance: getInstrumentationizabilityAdminGuidance({ stats }),
    })
  }

  async executeInstrumentationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_instrumentationizability_summary'
    },
  ) {
    this.assertCanManageInstrumentationizability(authContext)

    const payload = instrumentationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_instrumentationizability_summary': {
        const summary = await this.getWorkspaceInstrumentationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return instrumentationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed instrumentationizability summary with ${summary.stats.instrumentationizabilityPercent}% shield scan instrumentationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInstrumentationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production instrumentationizability tools.',
    })
  }
}
