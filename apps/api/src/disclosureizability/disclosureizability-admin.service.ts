import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDisclosureizabilityRolloutGuidance,
  disclosureizabilityAdminActionRequestSchema,
  disclosureizabilityAdminActionResponseSchema,
  disclosureizabilityAdminSummaryResponseSchema,
  disclosureizabilityCapabilitiesResponseSchema,
  disclosureizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDisclosureizabilityAdminRecords,
  buildDisclosureizabilityAdminStats,
  getDisclosureizabilityAdminGuidance,
  resolveDisclosureizabilityAdminActions,
} from './disclosureizability-admin.helpers.js'
import { evaluateDisclosureizabilityRollout } from './disclosureizability-rollout.helpers.js'
import { DisclosureizabilityStatusService } from './disclosureizability-status.service.js'

@Injectable()
export class DisclosureizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly disclosureizabilityStatusService: DisclosureizabilityStatusService,
  ) {}

  getCapabilities() {
    return disclosureizabilityCapabilitiesResponseSchema.parse({
      supportsDisclosureizabilityRollout: true,
      supportsDisclosureizabilityAdminTools: true,
      supportsIdempotencyKeyDisclosureizabilitySignals: true,
      supportsUsageEventDisclosureizabilitySignals: true,
      guidance: getDisclosureizabilityRolloutGuidance(),
    })
  }

  async getDisclosureizabilityRollout() {
    const disclosureizabilityTableCoverage =
      await this.disclosureizabilityStatusService.getDisclosureizabilityTableCoverage()

    const rollout = evaluateDisclosureizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.disclosureizabilityStatusService.pingPostgres(),
      existingDisclosureizabilityTableCount: disclosureizabilityTableCoverage.existingDisclosureizabilityTableCount,
      idempotencyKeysTableExists: disclosureizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: disclosureizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: disclosureizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return disclosureizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDisclosureizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDisclosureizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.disclosureizabilityStatusService.getWorkspaceDisclosureizabilityInventory(
        workspaceId,
      )
    const records = buildDisclosureizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.disclosureizabilityStatusService.pingPostgres()
    const stats = buildDisclosureizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return disclosureizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDisclosureizabilityAdminActions(),
      guidance: getDisclosureizabilityAdminGuidance({ stats }),
    })
  }

  async executeDisclosureizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_disclosureizability_summary'
    },
  ) {
    this.assertCanManageDisclosureizability(authContext)

    const payload = disclosureizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_disclosureizability_summary': {
        const summary = await this.getWorkspaceDisclosureizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return disclosureizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed disclosureizability summary with ${summary.stats.disclosureizabilityPercent}% idempotency key disclosureizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDisclosureizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production disclosureizability tools.',
    })
  }
}
