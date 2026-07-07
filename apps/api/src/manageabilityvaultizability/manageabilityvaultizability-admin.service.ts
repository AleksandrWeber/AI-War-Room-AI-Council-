import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getManageabilityvaultizabilityRolloutGuidance,
  manageabilityvaultizabilityAdminActionRequestSchema,
  manageabilityvaultizabilityAdminActionResponseSchema,
  manageabilityvaultizabilityAdminSummaryResponseSchema,
  manageabilityvaultizabilityCapabilitiesResponseSchema,
  manageabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildManageabilityvaultizabilityAdminRecords,
  buildManageabilityvaultizabilityAdminStats,
  getManageabilityvaultizabilityAdminGuidance,
  resolveManageabilityvaultizabilityAdminActions,
} from './manageabilityvaultizability-admin.helpers.js'
import { evaluateManageabilityvaultizabilityRollout } from './manageabilityvaultizability-rollout.helpers.js'
import { ManageabilityvaultizabilityStatusService } from './manageabilityvaultizability-status.service.js'

@Injectable()
export class ManageabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly manageabilityvaultizabilityStatusService: ManageabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return manageabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsManageabilityvaultizabilityRollout: true,
      supportsManageabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyManageabilityvaultizabilitySignals: true,
      supportsUsageEventManageabilityvaultizabilitySignals: true,
      guidance: getManageabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getManageabilityvaultizabilityRollout() {
    const manageabilityvaultizabilityTableCoverage =
      await this.manageabilityvaultizabilityStatusService.getManageabilityvaultizabilityTableCoverage()

    const rollout = evaluateManageabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.manageabilityvaultizabilityStatusService.pingPostgres(),
      existingManageabilityvaultizabilityTableCount: manageabilityvaultizabilityTableCoverage.existingManageabilityvaultizabilityTableCount,
      idempotencyKeysTableExists: manageabilityvaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: manageabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: manageabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return manageabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceManageabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageManageabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.manageabilityvaultizabilityStatusService.getWorkspaceManageabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildManageabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.manageabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildManageabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return manageabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveManageabilityvaultizabilityAdminActions(),
      guidance: getManageabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeManageabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_manageabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageManageabilityvaultizability(authContext)

    const payload = manageabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_manageabilityvaultizability_summary': {
        const summary = await this.getWorkspaceManageabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return manageabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed manageabilityvaultizability summary with ${summary.stats.manageabilityvaultizabilityPercent}% idempotency key manageabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageManageabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production manageabilityvaultizability tools.',
    })
  }
}
