import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCodifiabilityRolloutGuidance,
  codifiabilityAdminActionRequestSchema,
  codifiabilityAdminActionResponseSchema,
  codifiabilityAdminSummaryResponseSchema,
  codifiabilityCapabilitiesResponseSchema,
  codifiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCodifiabilityAdminRecords,
  buildCodifiabilityAdminStats,
  getCodifiabilityAdminGuidance,
  resolveCodifiabilityAdminActions,
} from './codifiability-admin.helpers.js'
import { evaluateCodifiabilityRollout } from './codifiability-rollout.helpers.js'
import { CodifiabilityStatusService } from './codifiability-status.service.js'

@Injectable()
export class CodifiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly codifiabilityStatusService: CodifiabilityStatusService,
  ) {}

  getCapabilities() {
    return codifiabilityCapabilitiesResponseSchema.parse({
      supportsCodifiabilityRollout: true,
      supportsCodifiabilityAdminTools: true,
      supportsProviderCredentialCodifiabilitySignals: true,
      supportsModelRegistryCodifiabilitySignals: true,
      guidance: getCodifiabilityRolloutGuidance(),
    })
  }

  async getCodifiabilityRollout() {
    const codifiabilityTableCoverage =
      await this.codifiabilityStatusService.getCodifiabilityTableCoverage()

    const rollout = evaluateCodifiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.codifiabilityStatusService.pingPostgres(),
      existingCodifiabilityTableCount: codifiabilityTableCoverage.existingCodifiabilityTableCount,
      workspaceProviderCredentialsTableExists: codifiabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: codifiabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: codifiabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return codifiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCodifiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCodifiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.codifiabilityStatusService.getWorkspaceCodifiabilityInventory(
        workspaceId,
      )
    const records = buildCodifiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.codifiabilityStatusService.pingPostgres()
    const stats = buildCodifiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return codifiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCodifiabilityAdminActions(),
      guidance: getCodifiabilityAdminGuidance({ stats }),
    })
  }

  async executeCodifiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_codifiability_summary'
    },
  ) {
    this.assertCanManageCodifiability(authContext)

    const payload = codifiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_codifiability_summary': {
        const summary = await this.getWorkspaceCodifiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return codifiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed codifiability summary with ${summary.stats.codifiabilityPercent}% provider credential codifiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCodifiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production codifiability tools.',
    })
  }
}
