import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRegistrarproofizabilityRolloutGuidance,
  registrarproofizabilityAdminActionRequestSchema,
  registrarproofizabilityAdminActionResponseSchema,
  registrarproofizabilityAdminSummaryResponseSchema,
  registrarproofizabilityCapabilitiesResponseSchema,
  registrarproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRegistrarproofizabilityAdminRecords,
  buildRegistrarproofizabilityAdminStats,
  getRegistrarproofizabilityAdminGuidance,
  resolveRegistrarproofizabilityAdminActions,
} from './registrarproofizability-admin.helpers.js'
import { evaluateRegistrarproofizabilityRollout } from './registrarproofizability-rollout.helpers.js'
import { RegistrarproofizabilityStatusService } from './registrarproofizability-status.service.js'

@Injectable()
export class RegistrarproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly registrarproofizabilityStatusService: RegistrarproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return registrarproofizabilityCapabilitiesResponseSchema.parse({
      supportsRegistrarproofizabilityRollout: true,
      supportsRegistrarproofizabilityAdminTools: true,
      supportsShieldScanRegistrarproofizabilitySignals: true,
      supportsProviderCredentialRegistrarproofizabilitySignals: true,
      guidance: getRegistrarproofizabilityRolloutGuidance(),
    })
  }

  async getRegistrarproofizabilityRollout() {
    const registrarproofizabilityTableCoverage =
      await this.registrarproofizabilityStatusService.getRegistrarproofizabilityTableCoverage()

    const rollout = evaluateRegistrarproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.registrarproofizabilityStatusService.pingPostgres(),
      existingRegistrarproofizabilityTableCount: registrarproofizabilityTableCoverage.existingRegistrarproofizabilityTableCount,
      shieldScansTableExists: registrarproofizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: registrarproofizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: registrarproofizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return registrarproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRegistrarproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRegistrarproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.registrarproofizabilityStatusService.getWorkspaceRegistrarproofizabilityInventory(
        workspaceId,
      )
    const records = buildRegistrarproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.registrarproofizabilityStatusService.pingPostgres()
    const stats = buildRegistrarproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return registrarproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRegistrarproofizabilityAdminActions(),
      guidance: getRegistrarproofizabilityAdminGuidance({ stats }),
    })
  }

  async executeRegistrarproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_registrarproofizability_summary'
    },
  ) {
    this.assertCanManageRegistrarproofizability(authContext)

    const payload = registrarproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_registrarproofizability_summary': {
        const summary = await this.getWorkspaceRegistrarproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return registrarproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed registrarproofizability summary with ${summary.stats.registrarproofizabilityPercent}% shield scan registrarproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRegistrarproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production registrarproofizability tools.',
    })
  }
}
