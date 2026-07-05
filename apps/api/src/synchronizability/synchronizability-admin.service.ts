import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSynchronizabilityRolloutGuidance,
  synchronizabilityAdminActionRequestSchema,
  synchronizabilityAdminActionResponseSchema,
  synchronizabilityAdminSummaryResponseSchema,
  synchronizabilityCapabilitiesResponseSchema,
  synchronizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSynchronizabilityAdminRecords,
  buildSynchronizabilityAdminStats,
  getSynchronizabilityAdminGuidance,
  resolveSynchronizabilityAdminActions,
} from './synchronizability-admin.helpers.js'
import { evaluateSynchronizabilityRollout } from './synchronizability-rollout.helpers.js'
import { SynchronizabilityStatusService } from './synchronizability-status.service.js'

@Injectable()
export class SynchronizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly synchronizabilityStatusService: SynchronizabilityStatusService,
  ) {}

  getCapabilities() {
    return synchronizabilityCapabilitiesResponseSchema.parse({
      supportsSynchronizabilityRollout: true,
      supportsSynchronizabilityAdminTools: true,
      supportsIdempotencyKeySynchronizabilitySignals: true,
      supportsUsageEventSynchronizabilitySignals: true,
      guidance: getSynchronizabilityRolloutGuidance(),
    })
  }

  async getSynchronizabilityRollout() {
    const synchronizabilityTableCoverage =
      await this.synchronizabilityStatusService.getSynchronizabilityTableCoverage()

    const rollout = evaluateSynchronizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.synchronizabilityStatusService.pingPostgres(),
      existingSynchronizabilityTableCount: synchronizabilityTableCoverage.existingSynchronizabilityTableCount,
      idempotencyKeysTableExists: synchronizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: synchronizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: synchronizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return synchronizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSynchronizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSynchronizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.synchronizabilityStatusService.getWorkspaceSynchronizabilityInventory(
        workspaceId,
      )
    const records = buildSynchronizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.synchronizabilityStatusService.pingPostgres()
    const stats = buildSynchronizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return synchronizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSynchronizabilityAdminActions(),
      guidance: getSynchronizabilityAdminGuidance({ stats }),
    })
  }

  async executeSynchronizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_synchronizability_summary'
    },
  ) {
    this.assertCanManageSynchronizability(authContext)

    const payload = synchronizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_synchronizability_summary': {
        const summary = await this.getWorkspaceSynchronizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return synchronizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed synchronizability summary with ${summary.stats.synchronizabilityPercent}% idempotency key synchronizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSynchronizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production synchronizability tools.',
    })
  }
}
