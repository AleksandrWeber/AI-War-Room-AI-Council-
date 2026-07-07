import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTransferabilityvaultizabilityRolloutGuidance,
  transferabilityvaultizabilityAdminActionRequestSchema,
  transferabilityvaultizabilityAdminActionResponseSchema,
  transferabilityvaultizabilityAdminSummaryResponseSchema,
  transferabilityvaultizabilityCapabilitiesResponseSchema,
  transferabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTransferabilityvaultizabilityAdminRecords,
  buildTransferabilityvaultizabilityAdminStats,
  getTransferabilityvaultizabilityAdminGuidance,
  resolveTransferabilityvaultizabilityAdminActions,
} from './transferabilityvaultizability-admin.helpers.js'
import { evaluateTransferabilityvaultizabilityRollout } from './transferabilityvaultizability-rollout.helpers.js'
import { TransferabilityvaultizabilityStatusService } from './transferabilityvaultizability-status.service.js'

@Injectable()
export class TransferabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly transferabilityvaultizabilityStatusService: TransferabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return transferabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsTransferabilityvaultizabilityRollout: true,
      supportsTransferabilityvaultizabilityAdminTools: true,
      supportsShieldScanTransferabilityvaultizabilitySignals: true,
      supportsProviderCredentialTransferabilityvaultizabilitySignals: true,
      guidance: getTransferabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getTransferabilityvaultizabilityRollout() {
    const transferabilityvaultizabilityTableCoverage =
      await this.transferabilityvaultizabilityStatusService.getTransferabilityvaultizabilityTableCoverage()

    const rollout = evaluateTransferabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.transferabilityvaultizabilityStatusService.pingPostgres(),
      existingTransferabilityvaultizabilityTableCount: transferabilityvaultizabilityTableCoverage.existingTransferabilityvaultizabilityTableCount,
      shieldScansTableExists: transferabilityvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: transferabilityvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: transferabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return transferabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTransferabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTransferabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.transferabilityvaultizabilityStatusService.getWorkspaceTransferabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildTransferabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.transferabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildTransferabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return transferabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTransferabilityvaultizabilityAdminActions(),
      guidance: getTransferabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeTransferabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_transferabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageTransferabilityvaultizability(authContext)

    const payload = transferabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_transferabilityvaultizability_summary': {
        const summary = await this.getWorkspaceTransferabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return transferabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed transferabilityvaultizability summary with ${summary.stats.transferabilityvaultizabilityPercent}% shield scan transferabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTransferabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production transferabilityvaultizability tools.',
    })
  }
}
