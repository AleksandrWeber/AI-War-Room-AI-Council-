import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAvailabilizabilityRolloutGuidance,
  availabilizabilityAdminActionRequestSchema,
  availabilizabilityAdminActionResponseSchema,
  availabilizabilityAdminSummaryResponseSchema,
  availabilizabilityCapabilitiesResponseSchema,
  availabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAvailabilizabilityAdminRecords,
  buildAvailabilizabilityAdminStats,
  getAvailabilizabilityAdminGuidance,
  resolveAvailabilizabilityAdminActions,
} from './availabilizability-admin.helpers.js'
import { evaluateAvailabilizabilityRollout } from './availabilizability-rollout.helpers.js'
import { AvailabilizabilityStatusService } from './availabilizability-status.service.js'

@Injectable()
export class AvailabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly availabilizabilityStatusService: AvailabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return availabilizabilityCapabilitiesResponseSchema.parse({
      supportsAvailabilizabilityRollout: true,
      supportsAvailabilizabilityAdminTools: true,
      supportsShieldScanAvailabilizabilitySignals: true,
      supportsProviderCredentialAvailabilizabilitySignals: true,
      guidance: getAvailabilizabilityRolloutGuidance(),
    })
  }

  async getAvailabilizabilityRollout() {
    const availabilizabilityTableCoverage =
      await this.availabilizabilityStatusService.getAvailabilizabilityTableCoverage()

    const rollout = evaluateAvailabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.availabilizabilityStatusService.pingPostgres(),
      existingAvailabilizabilityTableCount: availabilizabilityTableCoverage.existingAvailabilizabilityTableCount,
      shieldScansTableExists: availabilizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: availabilizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: availabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return availabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAvailabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAvailabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.availabilizabilityStatusService.getWorkspaceAvailabilizabilityInventory(
        workspaceId,
      )
    const records = buildAvailabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.availabilizabilityStatusService.pingPostgres()
    const stats = buildAvailabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return availabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAvailabilizabilityAdminActions(),
      guidance: getAvailabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeAvailabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_availabilizability_summary'
    },
  ) {
    this.assertCanManageAvailabilizability(authContext)

    const payload = availabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_availabilizability_summary': {
        const summary = await this.getWorkspaceAvailabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return availabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed availabilizability summary with ${summary.stats.availabilizabilityPercent}% shield scan availabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAvailabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production availabilizability tools.',
    })
  }
}
