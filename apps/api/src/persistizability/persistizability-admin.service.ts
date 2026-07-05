import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPersistizabilityRolloutGuidance,
  persistizabilityAdminActionRequestSchema,
  persistizabilityAdminActionResponseSchema,
  persistizabilityAdminSummaryResponseSchema,
  persistizabilityCapabilitiesResponseSchema,
  persistizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPersistizabilityAdminRecords,
  buildPersistizabilityAdminStats,
  getPersistizabilityAdminGuidance,
  resolvePersistizabilityAdminActions,
} from './persistizability-admin.helpers.js'
import { evaluatePersistizabilityRollout } from './persistizability-rollout.helpers.js'
import { PersistizabilityStatusService } from './persistizability-status.service.js'

@Injectable()
export class PersistizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly persistizabilityStatusService: PersistizabilityStatusService,
  ) {}

  getCapabilities() {
    return persistizabilityCapabilitiesResponseSchema.parse({
      supportsPersistizabilityRollout: true,
      supportsPersistizabilityAdminTools: true,
      supportsIdempotencyKeyPersistizabilitySignals: true,
      supportsUsageEventPersistizabilitySignals: true,
      guidance: getPersistizabilityRolloutGuidance(),
    })
  }

  async getPersistizabilityRollout() {
    const persistizabilityTableCoverage =
      await this.persistizabilityStatusService.getPersistizabilityTableCoverage()

    const rollout = evaluatePersistizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.persistizabilityStatusService.pingPostgres(),
      existingPersistizabilityTableCount: persistizabilityTableCoverage.existingPersistizabilityTableCount,
      idempotencyKeysTableExists: persistizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: persistizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: persistizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return persistizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePersistizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePersistizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.persistizabilityStatusService.getWorkspacePersistizabilityInventory(
        workspaceId,
      )
    const records = buildPersistizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.persistizabilityStatusService.pingPostgres()
    const stats = buildPersistizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return persistizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePersistizabilityAdminActions(),
      guidance: getPersistizabilityAdminGuidance({ stats }),
    })
  }

  async executePersistizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_persistizability_summary'
    },
  ) {
    this.assertCanManagePersistizability(authContext)

    const payload = persistizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_persistizability_summary': {
        const summary = await this.getWorkspacePersistizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return persistizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed persistizability summary with ${summary.stats.persistizabilityPercent}% idempotency key persistizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePersistizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production persistizability tools.',
    })
  }
}
