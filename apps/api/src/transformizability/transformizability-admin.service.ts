import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTransformizabilityRolloutGuidance,
  transformizabilityAdminActionRequestSchema,
  transformizabilityAdminActionResponseSchema,
  transformizabilityAdminSummaryResponseSchema,
  transformizabilityCapabilitiesResponseSchema,
  transformizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTransformizabilityAdminRecords,
  buildTransformizabilityAdminStats,
  getTransformizabilityAdminGuidance,
  resolveTransformizabilityAdminActions,
} from './transformizability-admin.helpers.js'
import { evaluateTransformizabilityRollout } from './transformizability-rollout.helpers.js'
import { TransformizabilityStatusService } from './transformizability-status.service.js'

@Injectable()
export class TransformizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly transformizabilityStatusService: TransformizabilityStatusService,
  ) {}

  getCapabilities() {
    return transformizabilityCapabilitiesResponseSchema.parse({
      supportsTransformizabilityRollout: true,
      supportsTransformizabilityAdminTools: true,
      supportsBillingWebhookTransformizabilitySignals: true,
      supportsBillingRecordTransformizabilitySignals: true,
      guidance: getTransformizabilityRolloutGuidance(),
    })
  }

  async getTransformizabilityRollout() {
    const transformizabilityTableCoverage =
      await this.transformizabilityStatusService.getTransformizabilityTableCoverage()

    const rollout = evaluateTransformizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.transformizabilityStatusService.pingPostgres(),
      existingTransformizabilityTableCount: transformizabilityTableCoverage.existingTransformizabilityTableCount,
      billingWebhookEventsTableExists: transformizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: transformizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: transformizabilityTableCoverage.usageEventsTableExists,
    })

    return transformizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTransformizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTransformizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.transformizabilityStatusService.getWorkspaceTransformizabilityInventory(
        workspaceId,
      )
    const records = buildTransformizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.transformizabilityStatusService.pingPostgres()
    const stats = buildTransformizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return transformizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTransformizabilityAdminActions(),
      guidance: getTransformizabilityAdminGuidance({ stats }),
    })
  }

  async executeTransformizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_transformizability_summary'
    },
  ) {
    this.assertCanManageTransformizability(authContext)

    const payload = transformizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_transformizability_summary': {
        const summary = await this.getWorkspaceTransformizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return transformizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed transformizability summary with ${summary.stats.transformizabilityPercent}% billing webhook transformizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTransformizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production transformizability tools.',
    })
  }
}
