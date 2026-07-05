import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCheckpointizabilityRolloutGuidance,
  checkpointizabilityAdminActionRequestSchema,
  checkpointizabilityAdminActionResponseSchema,
  checkpointizabilityAdminSummaryResponseSchema,
  checkpointizabilityCapabilitiesResponseSchema,
  checkpointizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCheckpointizabilityAdminRecords,
  buildCheckpointizabilityAdminStats,
  getCheckpointizabilityAdminGuidance,
  resolveCheckpointizabilityAdminActions,
} from './checkpointizability-admin.helpers.js'
import { evaluateCheckpointizabilityRollout } from './checkpointizability-rollout.helpers.js'
import { CheckpointizabilityStatusService } from './checkpointizability-status.service.js'

@Injectable()
export class CheckpointizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly checkpointizabilityStatusService: CheckpointizabilityStatusService,
  ) {}

  getCapabilities() {
    return checkpointizabilityCapabilitiesResponseSchema.parse({
      supportsCheckpointizabilityRollout: true,
      supportsCheckpointizabilityAdminTools: true,
      supportsBillingInvoiceCheckpointizabilitySignals: true,
      supportsBillingRecordCheckpointizabilitySignals: true,
      guidance: getCheckpointizabilityRolloutGuidance(),
    })
  }

  async getCheckpointizabilityRollout() {
    const checkpointizabilityTableCoverage =
      await this.checkpointizabilityStatusService.getCheckpointizabilityTableCoverage()

    const rollout = evaluateCheckpointizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.checkpointizabilityStatusService.pingPostgres(),
      existingCheckpointizabilityTableCount: checkpointizabilityTableCoverage.existingCheckpointizabilityTableCount,
      billingInvoicesTableExists: checkpointizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: checkpointizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: checkpointizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return checkpointizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCheckpointizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCheckpointizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.checkpointizabilityStatusService.getWorkspaceCheckpointizabilityInventory(
        workspaceId,
      )
    const records = buildCheckpointizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.checkpointizabilityStatusService.pingPostgres()
    const stats = buildCheckpointizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return checkpointizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCheckpointizabilityAdminActions(),
      guidance: getCheckpointizabilityAdminGuidance({ stats }),
    })
  }

  async executeCheckpointizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_checkpointizability_summary'
    },
  ) {
    this.assertCanManageCheckpointizability(authContext)

    const payload = checkpointizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_checkpointizability_summary': {
        const summary = await this.getWorkspaceCheckpointizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return checkpointizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed checkpointizability summary with ${summary.stats.checkpointizabilityPercent}% billing invoice checkpointizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCheckpointizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production checkpointizability tools.',
    })
  }
}
