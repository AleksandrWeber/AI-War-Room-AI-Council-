import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFlexibilityvaultizabilityRolloutGuidance,
  flexibilityvaultizabilityAdminActionRequestSchema,
  flexibilityvaultizabilityAdminActionResponseSchema,
  flexibilityvaultizabilityAdminSummaryResponseSchema,
  flexibilityvaultizabilityCapabilitiesResponseSchema,
  flexibilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFlexibilityvaultizabilityAdminRecords,
  buildFlexibilityvaultizabilityAdminStats,
  getFlexibilityvaultizabilityAdminGuidance,
  resolveFlexibilityvaultizabilityAdminActions,
} from './flexibilityvaultizability-admin.helpers.js'
import { evaluateFlexibilityvaultizabilityRollout } from './flexibilityvaultizability-rollout.helpers.js'
import { FlexibilityvaultizabilityStatusService } from './flexibilityvaultizability-status.service.js'

@Injectable()
export class FlexibilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly flexibilityvaultizabilityStatusService: FlexibilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return flexibilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsFlexibilityvaultizabilityRollout: true,
      supportsFlexibilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyFlexibilityvaultizabilitySignals: true,
      supportsUsageEventFlexibilityvaultizabilitySignals: true,
      guidance: getFlexibilityvaultizabilityRolloutGuidance(),
    })
  }

  async getFlexibilityvaultizabilityRollout() {
    const flexibilityvaultizabilityTableCoverage =
      await this.flexibilityvaultizabilityStatusService.getFlexibilityvaultizabilityTableCoverage()

    const rollout = evaluateFlexibilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.flexibilityvaultizabilityStatusService.pingPostgres(),
      existingFlexibilityvaultizabilityTableCount: flexibilityvaultizabilityTableCoverage.existingFlexibilityvaultizabilityTableCount,
      idempotencyKeysTableExists: flexibilityvaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: flexibilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: flexibilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return flexibilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFlexibilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFlexibilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.flexibilityvaultizabilityStatusService.getWorkspaceFlexibilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildFlexibilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.flexibilityvaultizabilityStatusService.pingPostgres()
    const stats = buildFlexibilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return flexibilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFlexibilityvaultizabilityAdminActions(),
      guidance: getFlexibilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeFlexibilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_flexibilityvaultizability_summary'
    },
  ) {
    this.assertCanManageFlexibilityvaultizability(authContext)

    const payload = flexibilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_flexibilityvaultizability_summary': {
        const summary = await this.getWorkspaceFlexibilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return flexibilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed flexibilityvaultizability summary with ${summary.stats.flexibilityvaultizabilityPercent}% idempotency key flexibilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFlexibilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production flexibilityvaultizability tools.',
    })
  }
}
