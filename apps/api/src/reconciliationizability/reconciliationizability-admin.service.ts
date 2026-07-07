import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReconciliationizabilityRolloutGuidance,
  reconciliationizabilityAdminActionRequestSchema,
  reconciliationizabilityAdminActionResponseSchema,
  reconciliationizabilityAdminSummaryResponseSchema,
  reconciliationizabilityCapabilitiesResponseSchema,
  reconciliationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReconciliationizabilityAdminRecords,
  buildReconciliationizabilityAdminStats,
  getReconciliationizabilityAdminGuidance,
  resolveReconciliationizabilityAdminActions,
} from './reconciliationizability-admin.helpers.js'
import { evaluateReconciliationizabilityRollout } from './reconciliationizability-rollout.helpers.js'
import { ReconciliationizabilityStatusService } from './reconciliationizability-status.service.js'

@Injectable()
export class ReconciliationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly reconciliationizabilityStatusService: ReconciliationizabilityStatusService,
  ) {}

  getCapabilities() {
    return reconciliationizabilityCapabilitiesResponseSchema.parse({
      supportsReconciliationizabilityRollout: true,
      supportsReconciliationizabilityAdminTools: true,
      supportsShieldScanReconciliationizabilitySignals: true,
      supportsProviderCredentialReconciliationizabilitySignals: true,
      guidance: getReconciliationizabilityRolloutGuidance(),
    })
  }

  async getReconciliationizabilityRollout() {
    const reconciliationizabilityTableCoverage =
      await this.reconciliationizabilityStatusService.getReconciliationizabilityTableCoverage()

    const rollout = evaluateReconciliationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.reconciliationizabilityStatusService.pingPostgres(),
      existingReconciliationizabilityTableCount: reconciliationizabilityTableCoverage.existingReconciliationizabilityTableCount,
      shieldScansTableExists: reconciliationizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: reconciliationizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: reconciliationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return reconciliationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReconciliationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReconciliationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.reconciliationizabilityStatusService.getWorkspaceReconciliationizabilityInventory(
        workspaceId,
      )
    const records = buildReconciliationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.reconciliationizabilityStatusService.pingPostgres()
    const stats = buildReconciliationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return reconciliationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReconciliationizabilityAdminActions(),
      guidance: getReconciliationizabilityAdminGuidance({ stats }),
    })
  }

  async executeReconciliationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_reconciliationizability_summary'
    },
  ) {
    this.assertCanManageReconciliationizability(authContext)

    const payload = reconciliationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_reconciliationizability_summary': {
        const summary = await this.getWorkspaceReconciliationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return reconciliationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed reconciliationizability summary with ${summary.stats.reconciliationizabilityPercent}% shield scan reconciliationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReconciliationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production reconciliationizability tools.',
    })
  }
}
