import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getThesaurusizabilityRolloutGuidance,
  thesaurusizabilityAdminActionRequestSchema,
  thesaurusizabilityAdminActionResponseSchema,
  thesaurusizabilityAdminSummaryResponseSchema,
  thesaurusizabilityCapabilitiesResponseSchema,
  thesaurusizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildThesaurusizabilityAdminRecords,
  buildThesaurusizabilityAdminStats,
  getThesaurusizabilityAdminGuidance,
  resolveThesaurusizabilityAdminActions,
} from './thesaurusizability-admin.helpers.js'
import { evaluateThesaurusizabilityRollout } from './thesaurusizability-rollout.helpers.js'
import { ThesaurusizabilityStatusService } from './thesaurusizability-status.service.js'

@Injectable()
export class ThesaurusizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly thesaurusizabilityStatusService: ThesaurusizabilityStatusService,
  ) {}

  getCapabilities() {
    return thesaurusizabilityCapabilitiesResponseSchema.parse({
      supportsThesaurusizabilityRollout: true,
      supportsThesaurusizabilityAdminTools: true,
      supportsIdempotencyKeyThesaurusizabilitySignals: true,
      supportsUsageEventThesaurusizabilitySignals: true,
      guidance: getThesaurusizabilityRolloutGuidance(),
    })
  }

  async getThesaurusizabilityRollout() {
    const thesaurusizabilityTableCoverage =
      await this.thesaurusizabilityStatusService.getThesaurusizabilityTableCoverage()

    const rollout = evaluateThesaurusizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.thesaurusizabilityStatusService.pingPostgres(),
      existingThesaurusizabilityTableCount: thesaurusizabilityTableCoverage.existingThesaurusizabilityTableCount,
      idempotencyKeysTableExists: thesaurusizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: thesaurusizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: thesaurusizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return thesaurusizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceThesaurusizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageThesaurusizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.thesaurusizabilityStatusService.getWorkspaceThesaurusizabilityInventory(
        workspaceId,
      )
    const records = buildThesaurusizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.thesaurusizabilityStatusService.pingPostgres()
    const stats = buildThesaurusizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return thesaurusizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveThesaurusizabilityAdminActions(),
      guidance: getThesaurusizabilityAdminGuidance({ stats }),
    })
  }

  async executeThesaurusizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_thesaurusizability_summary'
    },
  ) {
    this.assertCanManageThesaurusizability(authContext)

    const payload = thesaurusizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_thesaurusizability_summary': {
        const summary = await this.getWorkspaceThesaurusizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return thesaurusizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed thesaurusizability summary with ${summary.stats.thesaurusizabilityPercent}% idempotency key thesaurusizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageThesaurusizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production thesaurusizability tools.',
    })
  }
}
