import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getParsabilityRolloutGuidance,
  parsabilityAdminActionRequestSchema,
  parsabilityAdminActionResponseSchema,
  parsabilityAdminSummaryResponseSchema,
  parsabilityCapabilitiesResponseSchema,
  parsabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildParsabilityAdminRecords,
  buildParsabilityAdminStats,
  getParsabilityAdminGuidance,
  resolveParsabilityAdminActions,
} from './parsability-admin.helpers.js'
import { evaluateParsabilityRollout } from './parsability-rollout.helpers.js'
import { ParsabilityStatusService } from './parsability-status.service.js'

@Injectable()
export class ParsabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly parsabilityStatusService: ParsabilityStatusService,
  ) {}

  getCapabilities() {
    return parsabilityCapabilitiesResponseSchema.parse({
      supportsParsabilityRollout: true,
      supportsParsabilityAdminTools: true,
      supportsIdempotencyKeyParsabilitySignals: true,
      supportsUsageEventParsabilitySignals: true,
      guidance: getParsabilityRolloutGuidance(),
    })
  }

  async getParsabilityRollout() {
    const parsabilityTableCoverage =
      await this.parsabilityStatusService.getParsabilityTableCoverage()

    const rollout = evaluateParsabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.parsabilityStatusService.pingPostgres(),
      existingParsabilityTableCount: parsabilityTableCoverage.existingParsabilityTableCount,
      idempotencyKeysTableExists: parsabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: parsabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: parsabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return parsabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceParsabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageParsability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.parsabilityStatusService.getWorkspaceParsabilityInventory(
        workspaceId,
      )
    const records = buildParsabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.parsabilityStatusService.pingPostgres()
    const stats = buildParsabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return parsabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveParsabilityAdminActions(),
      guidance: getParsabilityAdminGuidance({ stats }),
    })
  }

  async executeParsabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_parsability_summary'
    },
  ) {
    this.assertCanManageParsability(authContext)

    const payload = parsabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_parsability_summary': {
        const summary = await this.getWorkspaceParsabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return parsabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed parsability summary with ${summary.stats.parsabilityPercent}% idempotency key parsability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageParsability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production parsability tools.',
    })
  }
}
