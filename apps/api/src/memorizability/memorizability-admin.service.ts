import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMemorizabilityRolloutGuidance,
  memorizabilityAdminActionRequestSchema,
  memorizabilityAdminActionResponseSchema,
  memorizabilityAdminSummaryResponseSchema,
  memorizabilityCapabilitiesResponseSchema,
  memorizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMemorizabilityAdminRecords,
  buildMemorizabilityAdminStats,
  getMemorizabilityAdminGuidance,
  resolveMemorizabilityAdminActions,
} from './memorizability-admin.helpers.js'
import { evaluateMemorizabilityRollout } from './memorizability-rollout.helpers.js'
import { MemorizabilityStatusService } from './memorizability-status.service.js'

@Injectable()
export class MemorizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly memorizabilityStatusService: MemorizabilityStatusService,
  ) {}

  getCapabilities() {
    return memorizabilityCapabilitiesResponseSchema.parse({
      supportsMemorizabilityRollout: true,
      supportsMemorizabilityAdminTools: true,
      supportsShieldScanMemorizabilitySignals: true,
      supportsProviderCredentialMemorizabilitySignals: true,
      guidance: getMemorizabilityRolloutGuidance(),
    })
  }

  async getMemorizabilityRollout() {
    const memorizabilityTableCoverage =
      await this.memorizabilityStatusService.getMemorizabilityTableCoverage()

    const rollout = evaluateMemorizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.memorizabilityStatusService.pingPostgres(),
      existingMemorizabilityTableCount: memorizabilityTableCoverage.existingMemorizabilityTableCount,
      shieldScansTableExists: memorizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: memorizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: memorizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return memorizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMemorizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMemorizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.memorizabilityStatusService.getWorkspaceMemorizabilityInventory(
        workspaceId,
      )
    const records = buildMemorizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.memorizabilityStatusService.pingPostgres()
    const stats = buildMemorizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return memorizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMemorizabilityAdminActions(),
      guidance: getMemorizabilityAdminGuidance({ stats }),
    })
  }

  async executeMemorizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_memorizability_summary'
    },
  ) {
    this.assertCanManageMemorizability(authContext)

    const payload = memorizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_memorizability_summary': {
        const summary = await this.getWorkspaceMemorizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return memorizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed memorizability summary with ${summary.stats.memorizabilityPercent}% shield scan memorizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMemorizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production memorizability tools.',
    })
  }
}
