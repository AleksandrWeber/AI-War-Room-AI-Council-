import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDisclosureproofizabilityRolloutGuidance,
  disclosureproofizabilityAdminActionRequestSchema,
  disclosureproofizabilityAdminActionResponseSchema,
  disclosureproofizabilityAdminSummaryResponseSchema,
  disclosureproofizabilityCapabilitiesResponseSchema,
  disclosureproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDisclosureproofizabilityAdminRecords,
  buildDisclosureproofizabilityAdminStats,
  getDisclosureproofizabilityAdminGuidance,
  resolveDisclosureproofizabilityAdminActions,
} from './disclosureproofizability-admin.helpers.js'
import { evaluateDisclosureproofizabilityRollout } from './disclosureproofizability-rollout.helpers.js'
import { DisclosureproofizabilityStatusService } from './disclosureproofizability-status.service.js'

@Injectable()
export class DisclosureproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly disclosureproofizabilityStatusService: DisclosureproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return disclosureproofizabilityCapabilitiesResponseSchema.parse({
      supportsDisclosureproofizabilityRollout: true,
      supportsDisclosureproofizabilityAdminTools: true,
      supportsIdempotencyKeyDisclosureproofizabilitySignals: true,
      supportsUsageEventDisclosureproofizabilitySignals: true,
      guidance: getDisclosureproofizabilityRolloutGuidance(),
    })
  }

  async getDisclosureproofizabilityRollout() {
    const disclosureproofizabilityTableCoverage =
      await this.disclosureproofizabilityStatusService.getDisclosureproofizabilityTableCoverage()

    const rollout = evaluateDisclosureproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.disclosureproofizabilityStatusService.pingPostgres(),
      existingDisclosureproofizabilityTableCount: disclosureproofizabilityTableCoverage.existingDisclosureproofizabilityTableCount,
      idempotencyKeysTableExists: disclosureproofizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: disclosureproofizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: disclosureproofizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return disclosureproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDisclosureproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDisclosureproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.disclosureproofizabilityStatusService.getWorkspaceDisclosureproofizabilityInventory(
        workspaceId,
      )
    const records = buildDisclosureproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.disclosureproofizabilityStatusService.pingPostgres()
    const stats = buildDisclosureproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return disclosureproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDisclosureproofizabilityAdminActions(),
      guidance: getDisclosureproofizabilityAdminGuidance({ stats }),
    })
  }

  async executeDisclosureproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_disclosureproofizability_summary'
    },
  ) {
    this.assertCanManageDisclosureproofizability(authContext)

    const payload = disclosureproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_disclosureproofizability_summary': {
        const summary = await this.getWorkspaceDisclosureproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return disclosureproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed disclosureproofizability summary with ${summary.stats.disclosureproofizabilityPercent}% idempotency key disclosureproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDisclosureproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production disclosureproofizability tools.',
    })
  }
}
