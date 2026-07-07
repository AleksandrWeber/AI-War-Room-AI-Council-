import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSpecificationizabilityRolloutGuidance,
  specificationizabilityAdminActionRequestSchema,
  specificationizabilityAdminActionResponseSchema,
  specificationizabilityAdminSummaryResponseSchema,
  specificationizabilityCapabilitiesResponseSchema,
  specificationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSpecificationizabilityAdminRecords,
  buildSpecificationizabilityAdminStats,
  getSpecificationizabilityAdminGuidance,
  resolveSpecificationizabilityAdminActions,
} from './specificationizability-admin.helpers.js'
import { evaluateSpecificationizabilityRollout } from './specificationizability-rollout.helpers.js'
import { SpecificationizabilityStatusService } from './specificationizability-status.service.js'

@Injectable()
export class SpecificationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly specificationizabilityStatusService: SpecificationizabilityStatusService,
  ) {}

  getCapabilities() {
    return specificationizabilityCapabilitiesResponseSchema.parse({
      supportsSpecificationizabilityRollout: true,
      supportsSpecificationizabilityAdminTools: true,
      supportsIdempotencyKeySpecificationizabilitySignals: true,
      supportsUsageEventSpecificationizabilitySignals: true,
      guidance: getSpecificationizabilityRolloutGuidance(),
    })
  }

  async getSpecificationizabilityRollout() {
    const specificationizabilityTableCoverage =
      await this.specificationizabilityStatusService.getSpecificationizabilityTableCoverage()

    const rollout = evaluateSpecificationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.specificationizabilityStatusService.pingPostgres(),
      existingSpecificationizabilityTableCount: specificationizabilityTableCoverage.existingSpecificationizabilityTableCount,
      idempotencyKeysTableExists: specificationizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: specificationizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: specificationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return specificationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSpecificationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSpecificationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.specificationizabilityStatusService.getWorkspaceSpecificationizabilityInventory(
        workspaceId,
      )
    const records = buildSpecificationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.specificationizabilityStatusService.pingPostgres()
    const stats = buildSpecificationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return specificationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSpecificationizabilityAdminActions(),
      guidance: getSpecificationizabilityAdminGuidance({ stats }),
    })
  }

  async executeSpecificationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_specificationizability_summary'
    },
  ) {
    this.assertCanManageSpecificationizability(authContext)

    const payload = specificationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_specificationizability_summary': {
        const summary = await this.getWorkspaceSpecificationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return specificationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed specificationizability summary with ${summary.stats.specificationizabilityPercent}% idempotency key specificationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSpecificationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production specificationizability tools.',
    })
  }
}
