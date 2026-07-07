import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProvenancevaultizabilityRolloutGuidance,
  provenancevaultizabilityAdminActionRequestSchema,
  provenancevaultizabilityAdminActionResponseSchema,
  provenancevaultizabilityAdminSummaryResponseSchema,
  provenancevaultizabilityCapabilitiesResponseSchema,
  provenancevaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProvenancevaultizabilityAdminRecords,
  buildProvenancevaultizabilityAdminStats,
  getProvenancevaultizabilityAdminGuidance,
  resolveProvenancevaultizabilityAdminActions,
} from './provenancevaultizability-admin.helpers.js'
import { evaluateProvenancevaultizabilityRollout } from './provenancevaultizability-rollout.helpers.js'
import { ProvenancevaultizabilityStatusService } from './provenancevaultizability-status.service.js'

@Injectable()
export class ProvenancevaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly provenancevaultizabilityStatusService: ProvenancevaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return provenancevaultizabilityCapabilitiesResponseSchema.parse({
      supportsProvenancevaultizabilityRollout: true,
      supportsProvenancevaultizabilityAdminTools: true,
      supportsIdempotencyKeyProvenancevaultizabilitySignals: true,
      supportsUsageEventProvenancevaultizabilitySignals: true,
      guidance: getProvenancevaultizabilityRolloutGuidance(),
    })
  }

  async getProvenancevaultizabilityRollout() {
    const provenancevaultizabilityTableCoverage =
      await this.provenancevaultizabilityStatusService.getProvenancevaultizabilityTableCoverage()

    const rollout = evaluateProvenancevaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.provenancevaultizabilityStatusService.pingPostgres(),
      existingProvenancevaultizabilityTableCount: provenancevaultizabilityTableCoverage.existingProvenancevaultizabilityTableCount,
      idempotencyKeysTableExists: provenancevaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: provenancevaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: provenancevaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return provenancevaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProvenancevaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProvenancevaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.provenancevaultizabilityStatusService.getWorkspaceProvenancevaultizabilityInventory(
        workspaceId,
      )
    const records = buildProvenancevaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.provenancevaultizabilityStatusService.pingPostgres()
    const stats = buildProvenancevaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return provenancevaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProvenancevaultizabilityAdminActions(),
      guidance: getProvenancevaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeProvenancevaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_provenancevaultizability_summary'
    },
  ) {
    this.assertCanManageProvenancevaultizability(authContext)

    const payload = provenancevaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_provenancevaultizability_summary': {
        const summary = await this.getWorkspaceProvenancevaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return provenancevaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed provenancevaultizability summary with ${summary.stats.provenancevaultizabilityPercent}% idempotency key provenancevaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProvenancevaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production provenancevaultizability tools.',
    })
  }
}
