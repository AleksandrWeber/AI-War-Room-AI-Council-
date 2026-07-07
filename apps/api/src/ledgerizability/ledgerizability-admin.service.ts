import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLedgerizabilityRolloutGuidance,
  ledgerizabilityAdminActionRequestSchema,
  ledgerizabilityAdminActionResponseSchema,
  ledgerizabilityAdminSummaryResponseSchema,
  ledgerizabilityCapabilitiesResponseSchema,
  ledgerizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLedgerizabilityAdminRecords,
  buildLedgerizabilityAdminStats,
  getLedgerizabilityAdminGuidance,
  resolveLedgerizabilityAdminActions,
} from './ledgerizability-admin.helpers.js'
import { evaluateLedgerizabilityRollout } from './ledgerizability-rollout.helpers.js'
import { LedgerizabilityStatusService } from './ledgerizability-status.service.js'

@Injectable()
export class LedgerizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly ledgerizabilityStatusService: LedgerizabilityStatusService,
  ) {}

  getCapabilities() {
    return ledgerizabilityCapabilitiesResponseSchema.parse({
      supportsLedgerizabilityRollout: true,
      supportsLedgerizabilityAdminTools: true,
      supportsShieldScanLedgerizabilitySignals: true,
      supportsProviderCredentialLedgerizabilitySignals: true,
      guidance: getLedgerizabilityRolloutGuidance(),
    })
  }

  async getLedgerizabilityRollout() {
    const ledgerizabilityTableCoverage =
      await this.ledgerizabilityStatusService.getLedgerizabilityTableCoverage()

    const rollout = evaluateLedgerizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.ledgerizabilityStatusService.pingPostgres(),
      existingLedgerizabilityTableCount: ledgerizabilityTableCoverage.existingLedgerizabilityTableCount,
      shieldScansTableExists: ledgerizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: ledgerizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: ledgerizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return ledgerizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLedgerizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLedgerizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.ledgerizabilityStatusService.getWorkspaceLedgerizabilityInventory(
        workspaceId,
      )
    const records = buildLedgerizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.ledgerizabilityStatusService.pingPostgres()
    const stats = buildLedgerizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return ledgerizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLedgerizabilityAdminActions(),
      guidance: getLedgerizabilityAdminGuidance({ stats }),
    })
  }

  async executeLedgerizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_ledgerizability_summary'
    },
  ) {
    this.assertCanManageLedgerizability(authContext)

    const payload = ledgerizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_ledgerizability_summary': {
        const summary = await this.getWorkspaceLedgerizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return ledgerizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed ledgerizability summary with ${summary.stats.ledgerizabilityPercent}% shield scan ledgerizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLedgerizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production ledgerizability tools.',
    })
  }
}
