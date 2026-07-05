import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReleasizabilityRolloutGuidance,
  releasizabilityAdminActionRequestSchema,
  releasizabilityAdminActionResponseSchema,
  releasizabilityAdminSummaryResponseSchema,
  releasizabilityCapabilitiesResponseSchema,
  releasizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReleasizabilityAdminRecords,
  buildReleasizabilityAdminStats,
  getReleasizabilityAdminGuidance,
  resolveReleasizabilityAdminActions,
} from './releasizability-admin.helpers.js'
import { evaluateReleasizabilityRollout } from './releasizability-rollout.helpers.js'
import { ReleasizabilityStatusService } from './releasizability-status.service.js'

@Injectable()
export class ReleasizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly releasizabilityStatusService: ReleasizabilityStatusService,
  ) {}

  getCapabilities() {
    return releasizabilityCapabilitiesResponseSchema.parse({
      supportsReleasizabilityRollout: true,
      supportsReleasizabilityAdminTools: true,
      supportsBillingWebhookReleasizabilitySignals: true,
      supportsBillingRecordReleasizabilitySignals: true,
      guidance: getReleasizabilityRolloutGuidance(),
    })
  }

  async getReleasizabilityRollout() {
    const releasizabilityTableCoverage =
      await this.releasizabilityStatusService.getReleasizabilityTableCoverage()

    const rollout = evaluateReleasizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.releasizabilityStatusService.pingPostgres(),
      existingReleasizabilityTableCount: releasizabilityTableCoverage.existingReleasizabilityTableCount,
      billingWebhookEventsTableExists: releasizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: releasizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: releasizabilityTableCoverage.usageEventsTableExists,
    })

    return releasizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReleasizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReleasizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.releasizabilityStatusService.getWorkspaceReleasizabilityInventory(
        workspaceId,
      )
    const records = buildReleasizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.releasizabilityStatusService.pingPostgres()
    const stats = buildReleasizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return releasizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReleasizabilityAdminActions(),
      guidance: getReleasizabilityAdminGuidance({ stats }),
    })
  }

  async executeReleasizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_releasizability_summary'
    },
  ) {
    this.assertCanManageReleasizability(authContext)

    const payload = releasizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_releasizability_summary': {
        const summary = await this.getWorkspaceReleasizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return releasizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed releasizability summary with ${summary.stats.releasizabilityPercent}% billing webhook releasizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReleasizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production releasizability tools.',
    })
  }
}
