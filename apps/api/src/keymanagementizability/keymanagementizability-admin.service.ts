import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getKeymanagementizabilityRolloutGuidance,
  keymanagementizabilityAdminActionRequestSchema,
  keymanagementizabilityAdminActionResponseSchema,
  keymanagementizabilityAdminSummaryResponseSchema,
  keymanagementizabilityCapabilitiesResponseSchema,
  keymanagementizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildKeymanagementizabilityAdminRecords,
  buildKeymanagementizabilityAdminStats,
  getKeymanagementizabilityAdminGuidance,
  resolveKeymanagementizabilityAdminActions,
} from './keymanagementizability-admin.helpers.js'
import { evaluateKeymanagementizabilityRollout } from './keymanagementizability-rollout.helpers.js'
import { KeymanagementizabilityStatusService } from './keymanagementizability-status.service.js'

@Injectable()
export class KeymanagementizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly keymanagementizabilityStatusService: KeymanagementizabilityStatusService,
  ) {}

  getCapabilities() {
    return keymanagementizabilityCapabilitiesResponseSchema.parse({
      supportsKeymanagementizabilityRollout: true,
      supportsKeymanagementizabilityAdminTools: true,
      supportsMembershipKeymanagementizabilitySignals: true,
      supportsUsageEventKeymanagementizabilitySignals: true,
      guidance: getKeymanagementizabilityRolloutGuidance(),
    })
  }

  async getKeymanagementizabilityRollout() {
    const keymanagementizabilityTableCoverage =
      await this.keymanagementizabilityStatusService.getKeymanagementizabilityTableCoverage()

    const rollout = evaluateKeymanagementizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.keymanagementizabilityStatusService.pingPostgres(),
      existingKeymanagementizabilityTableCount: keymanagementizabilityTableCoverage.existingKeymanagementizabilityTableCount,
      workspaceMembershipsTableExists: keymanagementizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: keymanagementizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: keymanagementizabilityTableCoverage.billingNotificationsTableExists,
    })

    return keymanagementizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceKeymanagementizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageKeymanagementizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.keymanagementizabilityStatusService.getWorkspaceKeymanagementizabilityInventory(
        workspaceId,
      )
    const records = buildKeymanagementizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.keymanagementizabilityStatusService.pingPostgres()
    const stats = buildKeymanagementizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return keymanagementizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveKeymanagementizabilityAdminActions(),
      guidance: getKeymanagementizabilityAdminGuidance({ stats }),
    })
  }

  async executeKeymanagementizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_keymanagementizability_summary'
    },
  ) {
    this.assertCanManageKeymanagementizability(authContext)

    const payload = keymanagementizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_keymanagementizability_summary': {
        const summary = await this.getWorkspaceKeymanagementizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return keymanagementizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed keymanagementizability summary with ${summary.stats.keymanagementizabilityPercent}% membership keymanagementizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageKeymanagementizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production keymanagementizability tools.',
    })
  }
}
