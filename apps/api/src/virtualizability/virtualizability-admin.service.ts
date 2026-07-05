import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getVirtualizabilityRolloutGuidance,
  virtualizabilityAdminActionRequestSchema,
  virtualizabilityAdminActionResponseSchema,
  virtualizabilityAdminSummaryResponseSchema,
  virtualizabilityCapabilitiesResponseSchema,
  virtualizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildVirtualizabilityAdminRecords,
  buildVirtualizabilityAdminStats,
  getVirtualizabilityAdminGuidance,
  resolveVirtualizabilityAdminActions,
} from './virtualizability-admin.helpers.js'
import { evaluateVirtualizabilityRollout } from './virtualizability-rollout.helpers.js'
import { VirtualizabilityStatusService } from './virtualizability-status.service.js'

@Injectable()
export class VirtualizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly virtualizabilityStatusService: VirtualizabilityStatusService,
  ) {}

  getCapabilities() {
    return virtualizabilityCapabilitiesResponseSchema.parse({
      supportsVirtualizabilityRollout: true,
      supportsVirtualizabilityAdminTools: true,
      supportsBillingWebhookVirtualizabilitySignals: true,
      supportsBillingRecordVirtualizabilitySignals: true,
      guidance: getVirtualizabilityRolloutGuidance(),
    })
  }

  async getVirtualizabilityRollout() {
    const virtualizabilityTableCoverage =
      await this.virtualizabilityStatusService.getVirtualizabilityTableCoverage()

    const rollout = evaluateVirtualizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.virtualizabilityStatusService.pingPostgres(),
      existingVirtualizabilityTableCount: virtualizabilityTableCoverage.existingVirtualizabilityTableCount,
      billingWebhookEventsTableExists: virtualizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: virtualizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: virtualizabilityTableCoverage.usageEventsTableExists,
    })

    return virtualizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceVirtualizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageVirtualizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.virtualizabilityStatusService.getWorkspaceVirtualizabilityInventory(
        workspaceId,
      )
    const records = buildVirtualizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.virtualizabilityStatusService.pingPostgres()
    const stats = buildVirtualizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return virtualizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveVirtualizabilityAdminActions(),
      guidance: getVirtualizabilityAdminGuidance({ stats }),
    })
  }

  async executeVirtualizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_virtualizability_summary'
    },
  ) {
    this.assertCanManageVirtualizability(authContext)

    const payload = virtualizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_virtualizability_summary': {
        const summary = await this.getWorkspaceVirtualizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return virtualizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed virtualizability summary with ${summary.stats.virtualizabilityPercent}% billing webhook virtualizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageVirtualizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production virtualizability tools.',
    })
  }
}
