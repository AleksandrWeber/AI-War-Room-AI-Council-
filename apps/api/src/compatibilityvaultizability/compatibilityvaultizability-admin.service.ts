import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCompatibilityvaultizabilityRolloutGuidance,
  compatibilityvaultizabilityAdminActionRequestSchema,
  compatibilityvaultizabilityAdminActionResponseSchema,
  compatibilityvaultizabilityAdminSummaryResponseSchema,
  compatibilityvaultizabilityCapabilitiesResponseSchema,
  compatibilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCompatibilityvaultizabilityAdminRecords,
  buildCompatibilityvaultizabilityAdminStats,
  getCompatibilityvaultizabilityAdminGuidance,
  resolveCompatibilityvaultizabilityAdminActions,
} from './compatibilityvaultizability-admin.helpers.js'
import { evaluateCompatibilityvaultizabilityRollout } from './compatibilityvaultizability-rollout.helpers.js'
import { CompatibilityvaultizabilityStatusService } from './compatibilityvaultizability-status.service.js'

@Injectable()
export class CompatibilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly compatibilityvaultizabilityStatusService: CompatibilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return compatibilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsCompatibilityvaultizabilityRollout: true,
      supportsCompatibilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceCompatibilityvaultizabilitySignals: true,
      supportsBillingRecordCompatibilityvaultizabilitySignals: true,
      guidance: getCompatibilityvaultizabilityRolloutGuidance(),
    })
  }

  async getCompatibilityvaultizabilityRollout() {
    const compatibilityvaultizabilityTableCoverage =
      await this.compatibilityvaultizabilityStatusService.getCompatibilityvaultizabilityTableCoverage()

    const rollout = evaluateCompatibilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.compatibilityvaultizabilityStatusService.pingPostgres(),
      existingCompatibilityvaultizabilityTableCount: compatibilityvaultizabilityTableCoverage.existingCompatibilityvaultizabilityTableCount,
      billingInvoicesTableExists: compatibilityvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: compatibilityvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: compatibilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return compatibilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCompatibilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCompatibilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.compatibilityvaultizabilityStatusService.getWorkspaceCompatibilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildCompatibilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.compatibilityvaultizabilityStatusService.pingPostgres()
    const stats = buildCompatibilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return compatibilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCompatibilityvaultizabilityAdminActions(),
      guidance: getCompatibilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeCompatibilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_compatibilityvaultizability_summary'
    },
  ) {
    this.assertCanManageCompatibilityvaultizability(authContext)

    const payload = compatibilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_compatibilityvaultizability_summary': {
        const summary = await this.getWorkspaceCompatibilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return compatibilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed compatibilityvaultizability summary with ${summary.stats.compatibilityvaultizabilityPercent}% billing invoice compatibilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCompatibilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production compatibilityvaultizability tools.',
    })
  }
}
