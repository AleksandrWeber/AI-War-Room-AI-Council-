import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCryptographyizabilityRolloutGuidance,
  cryptographyizabilityAdminActionRequestSchema,
  cryptographyizabilityAdminActionResponseSchema,
  cryptographyizabilityAdminSummaryResponseSchema,
  cryptographyizabilityCapabilitiesResponseSchema,
  cryptographyizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCryptographyizabilityAdminRecords,
  buildCryptographyizabilityAdminStats,
  getCryptographyizabilityAdminGuidance,
  resolveCryptographyizabilityAdminActions,
} from './cryptographyizability-admin.helpers.js'
import { evaluateCryptographyizabilityRollout } from './cryptographyizability-rollout.helpers.js'
import { CryptographyizabilityStatusService } from './cryptographyizability-status.service.js'

@Injectable()
export class CryptographyizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly cryptographyizabilityStatusService: CryptographyizabilityStatusService,
  ) {}

  getCapabilities() {
    return cryptographyizabilityCapabilitiesResponseSchema.parse({
      supportsCryptographyizabilityRollout: true,
      supportsCryptographyizabilityAdminTools: true,
      supportsShieldScanCryptographyizabilitySignals: true,
      supportsProviderCredentialCryptographyizabilitySignals: true,
      guidance: getCryptographyizabilityRolloutGuidance(),
    })
  }

  async getCryptographyizabilityRollout() {
    const cryptographyizabilityTableCoverage =
      await this.cryptographyizabilityStatusService.getCryptographyizabilityTableCoverage()

    const rollout = evaluateCryptographyizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.cryptographyizabilityStatusService.pingPostgres(),
      existingCryptographyizabilityTableCount: cryptographyizabilityTableCoverage.existingCryptographyizabilityTableCount,
      shieldScansTableExists: cryptographyizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: cryptographyizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: cryptographyizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return cryptographyizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCryptographyizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCryptographyizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.cryptographyizabilityStatusService.getWorkspaceCryptographyizabilityInventory(
        workspaceId,
      )
    const records = buildCryptographyizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.cryptographyizabilityStatusService.pingPostgres()
    const stats = buildCryptographyizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return cryptographyizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCryptographyizabilityAdminActions(),
      guidance: getCryptographyizabilityAdminGuidance({ stats }),
    })
  }

  async executeCryptographyizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_cryptographyizability_summary'
    },
  ) {
    this.assertCanManageCryptographyizability(authContext)

    const payload = cryptographyizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_cryptographyizability_summary': {
        const summary = await this.getWorkspaceCryptographyizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return cryptographyizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed cryptographyizability summary with ${summary.stats.cryptographyizabilityPercent}% shield scan cryptographyizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCryptographyizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production cryptographyizability tools.',
    })
  }
}
