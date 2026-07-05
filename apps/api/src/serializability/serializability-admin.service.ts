import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSerializabilityRolloutGuidance,
  serializabilityAdminActionRequestSchema,
  serializabilityAdminActionResponseSchema,
  serializabilityAdminSummaryResponseSchema,
  serializabilityCapabilitiesResponseSchema,
  serializabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSerializabilityAdminRecords,
  buildSerializabilityAdminStats,
  getSerializabilityAdminGuidance,
  resolveSerializabilityAdminActions,
} from './serializability-admin.helpers.js'
import { evaluateSerializabilityRollout } from './serializability-rollout.helpers.js'
import { SerializabilityStatusService } from './serializability-status.service.js'

@Injectable()
export class SerializabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly serializabilityStatusService: SerializabilityStatusService,
  ) {}

  getCapabilities() {
    return serializabilityCapabilitiesResponseSchema.parse({
      supportsSerializabilityRollout: true,
      supportsSerializabilityAdminTools: true,
      supportsProviderCredentialSerializabilitySignals: true,
      supportsModelRegistrySerializabilitySignals: true,
      guidance: getSerializabilityRolloutGuidance(),
    })
  }

  async getSerializabilityRollout() {
    const serializabilityTableCoverage =
      await this.serializabilityStatusService.getSerializabilityTableCoverage()

    const rollout = evaluateSerializabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.serializabilityStatusService.pingPostgres(),
      existingSerializabilityTableCount: serializabilityTableCoverage.existingSerializabilityTableCount,
      workspaceProviderCredentialsTableExists: serializabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: serializabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: serializabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return serializabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSerializabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSerializability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.serializabilityStatusService.getWorkspaceSerializabilityInventory(
        workspaceId,
      )
    const records = buildSerializabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.serializabilityStatusService.pingPostgres()
    const stats = buildSerializabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return serializabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSerializabilityAdminActions(),
      guidance: getSerializabilityAdminGuidance({ stats }),
    })
  }

  async executeSerializabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_serializability_summary'
    },
  ) {
    this.assertCanManageSerializability(authContext)

    const payload = serializabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_serializability_summary': {
        const summary = await this.getWorkspaceSerializabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return serializabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed serializability summary with ${summary.stats.serializabilityPercent}% provider credential serializability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSerializability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production serializability tools.',
    })
  }
}
