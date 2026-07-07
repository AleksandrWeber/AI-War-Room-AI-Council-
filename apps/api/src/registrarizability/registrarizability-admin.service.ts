import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRegistrarizabilityRolloutGuidance,
  registrarizabilityAdminActionRequestSchema,
  registrarizabilityAdminActionResponseSchema,
  registrarizabilityAdminSummaryResponseSchema,
  registrarizabilityCapabilitiesResponseSchema,
  registrarizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRegistrarizabilityAdminRecords,
  buildRegistrarizabilityAdminStats,
  getRegistrarizabilityAdminGuidance,
  resolveRegistrarizabilityAdminActions,
} from './registrarizability-admin.helpers.js'
import { evaluateRegistrarizabilityRollout } from './registrarizability-rollout.helpers.js'
import { RegistrarizabilityStatusService } from './registrarizability-status.service.js'

@Injectable()
export class RegistrarizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly registrarizabilityStatusService: RegistrarizabilityStatusService,
  ) {}

  getCapabilities() {
    return registrarizabilityCapabilitiesResponseSchema.parse({
      supportsRegistrarizabilityRollout: true,
      supportsRegistrarizabilityAdminTools: true,
      supportsShieldScanRegistrarizabilitySignals: true,
      supportsProviderCredentialRegistrarizabilitySignals: true,
      guidance: getRegistrarizabilityRolloutGuidance(),
    })
  }

  async getRegistrarizabilityRollout() {
    const registrarizabilityTableCoverage =
      await this.registrarizabilityStatusService.getRegistrarizabilityTableCoverage()

    const rollout = evaluateRegistrarizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.registrarizabilityStatusService.pingPostgres(),
      existingRegistrarizabilityTableCount: registrarizabilityTableCoverage.existingRegistrarizabilityTableCount,
      shieldScansTableExists: registrarizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: registrarizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: registrarizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return registrarizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRegistrarizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRegistrarizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.registrarizabilityStatusService.getWorkspaceRegistrarizabilityInventory(
        workspaceId,
      )
    const records = buildRegistrarizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.registrarizabilityStatusService.pingPostgres()
    const stats = buildRegistrarizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return registrarizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRegistrarizabilityAdminActions(),
      guidance: getRegistrarizabilityAdminGuidance({ stats }),
    })
  }

  async executeRegistrarizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_registrarizability_summary'
    },
  ) {
    this.assertCanManageRegistrarizability(authContext)

    const payload = registrarizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_registrarizability_summary': {
        const summary = await this.getWorkspaceRegistrarizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return registrarizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed registrarizability summary with ${summary.stats.registrarizabilityPercent}% shield scan registrarizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRegistrarizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production registrarizability tools.',
    })
  }
}
