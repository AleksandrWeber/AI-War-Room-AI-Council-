import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIdentifiabilityRolloutGuidance,
  identifiabilityAdminActionRequestSchema,
  identifiabilityAdminActionResponseSchema,
  identifiabilityAdminSummaryResponseSchema,
  identifiabilityCapabilitiesResponseSchema,
  identifiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIdentifiabilityAdminRecords,
  buildIdentifiabilityAdminStats,
  getIdentifiabilityAdminGuidance,
  resolveIdentifiabilityAdminActions,
} from './identifiability-admin.helpers.js'
import { evaluateIdentifiabilityRollout } from './identifiability-rollout.helpers.js'
import { IdentifiabilityStatusService } from './identifiability-status.service.js'

@Injectable()
export class IdentifiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly identifiabilityStatusService: IdentifiabilityStatusService,
  ) {}

  getCapabilities() {
    return identifiabilityCapabilitiesResponseSchema.parse({
      supportsIdentifiabilityRollout: true,
      supportsIdentifiabilityAdminTools: true,
      supportsIdempotencyKeyIdentifiabilitySignals: true,
      supportsProviderCredentialIdentifiabilitySignals: true,
      guidance: getIdentifiabilityRolloutGuidance(),
    })
  }

  async getIdentifiabilityRollout() {
    const identifiabilityTableCoverage =
      await this.identifiabilityStatusService.getIdentifiabilityTableCoverage()

    const rollout = evaluateIdentifiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.identifiabilityStatusService.pingPostgres(),
      existingIdentifiabilityTableCount: identifiabilityTableCoverage.existingIdentifiabilityTableCount,
      idempotencyKeysTableExists: identifiabilityTableCoverage.idempotencyKeysTableExists,
      workspaceProviderCredentialsTableExists: identifiabilityTableCoverage.workspaceProviderCredentialsTableExists,
      usageEventsTableExists: identifiabilityTableCoverage.usageEventsTableExists,
    })

    return identifiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIdentifiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIdentifiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.identifiabilityStatusService.getWorkspaceIdentifiabilityInventory(
        workspaceId,
      )
    const records = buildIdentifiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.identifiabilityStatusService.pingPostgres()
    const stats = buildIdentifiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return identifiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIdentifiabilityAdminActions(),
      guidance: getIdentifiabilityAdminGuidance({ stats }),
    })
  }

  async executeIdentifiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_identifiability_summary'
    },
  ) {
    this.assertCanManageIdentifiability(authContext)

    const payload = identifiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_identifiability_summary': {
        const summary = await this.getWorkspaceIdentifiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return identifiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed identifiability summary with ${summary.stats.identifiabilityPercent}% idempotency key identifiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIdentifiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production identifiability tools.',
    })
  }
}
