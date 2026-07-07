import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getValidityvaultizabilityRolloutGuidance,
  validityvaultizabilityAdminActionRequestSchema,
  validityvaultizabilityAdminActionResponseSchema,
  validityvaultizabilityAdminSummaryResponseSchema,
  validityvaultizabilityCapabilitiesResponseSchema,
  validityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildValidityvaultizabilityAdminRecords,
  buildValidityvaultizabilityAdminStats,
  getValidityvaultizabilityAdminGuidance,
  resolveValidityvaultizabilityAdminActions,
} from './validityvaultizability-admin.helpers.js'
import { evaluateValidityvaultizabilityRollout } from './validityvaultizability-rollout.helpers.js'
import { ValidityvaultizabilityStatusService } from './validityvaultizability-status.service.js'

@Injectable()
export class ValidityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly validityvaultizabilityStatusService: ValidityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return validityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsValidityvaultizabilityRollout: true,
      supportsValidityvaultizabilityAdminTools: true,
      supportsBillingInvoiceValidityvaultizabilitySignals: true,
      supportsBillingRecordValidityvaultizabilitySignals: true,
      guidance: getValidityvaultizabilityRolloutGuidance(),
    })
  }

  async getValidityvaultizabilityRollout() {
    const validityvaultizabilityTableCoverage =
      await this.validityvaultizabilityStatusService.getValidityvaultizabilityTableCoverage()

    const rollout = evaluateValidityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.validityvaultizabilityStatusService.pingPostgres(),
      existingValidityvaultizabilityTableCount: validityvaultizabilityTableCoverage.existingValidityvaultizabilityTableCount,
      billingInvoicesTableExists: validityvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: validityvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: validityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return validityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceValidityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageValidityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.validityvaultizabilityStatusService.getWorkspaceValidityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildValidityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.validityvaultizabilityStatusService.pingPostgres()
    const stats = buildValidityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return validityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveValidityvaultizabilityAdminActions(),
      guidance: getValidityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeValidityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_validityvaultizability_summary'
    },
  ) {
    this.assertCanManageValidityvaultizability(authContext)

    const payload = validityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_validityvaultizability_summary': {
        const summary = await this.getWorkspaceValidityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return validityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed validityvaultizability summary with ${summary.stats.validityvaultizabilityPercent}% billing invoice validityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageValidityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production validityvaultizability tools.',
    })
  }
}
