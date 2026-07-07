import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAccesscontrolizabilityRolloutGuidance,
  accesscontrolizabilityAdminActionRequestSchema,
  accesscontrolizabilityAdminActionResponseSchema,
  accesscontrolizabilityAdminSummaryResponseSchema,
  accesscontrolizabilityCapabilitiesResponseSchema,
  accesscontrolizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAccesscontrolizabilityAdminRecords,
  buildAccesscontrolizabilityAdminStats,
  getAccesscontrolizabilityAdminGuidance,
  resolveAccesscontrolizabilityAdminActions,
} from './accesscontrolizability-admin.helpers.js'
import { evaluateAccesscontrolizabilityRollout } from './accesscontrolizability-rollout.helpers.js'
import { AccesscontrolizabilityStatusService } from './accesscontrolizability-status.service.js'

@Injectable()
export class AccesscontrolizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly accesscontrolizabilityStatusService: AccesscontrolizabilityStatusService,
  ) {}

  getCapabilities() {
    return accesscontrolizabilityCapabilitiesResponseSchema.parse({
      supportsAccesscontrolizabilityRollout: true,
      supportsAccesscontrolizabilityAdminTools: true,
      supportsIdempotencyKeyAccesscontrolizabilitySignals: true,
      supportsUsageEventAccesscontrolizabilitySignals: true,
      guidance: getAccesscontrolizabilityRolloutGuidance(),
    })
  }

  async getAccesscontrolizabilityRollout() {
    const accesscontrolizabilityTableCoverage =
      await this.accesscontrolizabilityStatusService.getAccesscontrolizabilityTableCoverage()

    const rollout = evaluateAccesscontrolizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.accesscontrolizabilityStatusService.pingPostgres(),
      existingAccesscontrolizabilityTableCount: accesscontrolizabilityTableCoverage.existingAccesscontrolizabilityTableCount,
      idempotencyKeysTableExists: accesscontrolizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: accesscontrolizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: accesscontrolizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return accesscontrolizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAccesscontrolizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAccesscontrolizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.accesscontrolizabilityStatusService.getWorkspaceAccesscontrolizabilityInventory(
        workspaceId,
      )
    const records = buildAccesscontrolizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.accesscontrolizabilityStatusService.pingPostgres()
    const stats = buildAccesscontrolizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return accesscontrolizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAccesscontrolizabilityAdminActions(),
      guidance: getAccesscontrolizabilityAdminGuidance({ stats }),
    })
  }

  async executeAccesscontrolizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_accesscontrolizability_summary'
    },
  ) {
    this.assertCanManageAccesscontrolizability(authContext)

    const payload = accesscontrolizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_accesscontrolizability_summary': {
        const summary = await this.getWorkspaceAccesscontrolizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return accesscontrolizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed accesscontrolizability summary with ${summary.stats.accesscontrolizabilityPercent}% idempotency key accesscontrolizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAccesscontrolizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production accesscontrolizability tools.',
    })
  }
}
