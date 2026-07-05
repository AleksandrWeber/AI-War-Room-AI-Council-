import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBufferizabilityRolloutGuidance,
  bufferizabilityAdminActionRequestSchema,
  bufferizabilityAdminActionResponseSchema,
  bufferizabilityAdminSummaryResponseSchema,
  bufferizabilityCapabilitiesResponseSchema,
  bufferizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBufferizabilityAdminRecords,
  buildBufferizabilityAdminStats,
  getBufferizabilityAdminGuidance,
  resolveBufferizabilityAdminActions,
} from './bufferizability-admin.helpers.js'
import { evaluateBufferizabilityRollout } from './bufferizability-rollout.helpers.js'
import { BufferizabilityStatusService } from './bufferizability-status.service.js'

@Injectable()
export class BufferizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly bufferizabilityStatusService: BufferizabilityStatusService,
  ) {}

  getCapabilities() {
    return bufferizabilityCapabilitiesResponseSchema.parse({
      supportsBufferizabilityRollout: true,
      supportsBufferizabilityAdminTools: true,
      supportsShieldScanBufferizabilitySignals: true,
      supportsProviderCredentialBufferizabilitySignals: true,
      guidance: getBufferizabilityRolloutGuidance(),
    })
  }

  async getBufferizabilityRollout() {
    const bufferizabilityTableCoverage =
      await this.bufferizabilityStatusService.getBufferizabilityTableCoverage()

    const rollout = evaluateBufferizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.bufferizabilityStatusService.pingPostgres(),
      existingBufferizabilityTableCount: bufferizabilityTableCoverage.existingBufferizabilityTableCount,
      shieldScansTableExists: bufferizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: bufferizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: bufferizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return bufferizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBufferizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBufferizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.bufferizabilityStatusService.getWorkspaceBufferizabilityInventory(
        workspaceId,
      )
    const records = buildBufferizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.bufferizabilityStatusService.pingPostgres()
    const stats = buildBufferizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return bufferizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBufferizabilityAdminActions(),
      guidance: getBufferizabilityAdminGuidance({ stats }),
    })
  }

  async executeBufferizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_bufferizability_summary'
    },
  ) {
    this.assertCanManageBufferizability(authContext)

    const payload = bufferizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_bufferizability_summary': {
        const summary = await this.getWorkspaceBufferizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return bufferizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed bufferizability summary with ${summary.stats.bufferizabilityPercent}% shield scan bufferizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBufferizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production bufferizability tools.',
    })
  }
}
