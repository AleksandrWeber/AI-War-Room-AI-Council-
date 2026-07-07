import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRegistryvaultizabilityRolloutGuidance,
  registryvaultizabilityAdminActionRequestSchema,
  registryvaultizabilityAdminActionResponseSchema,
  registryvaultizabilityAdminSummaryResponseSchema,
  registryvaultizabilityCapabilitiesResponseSchema,
  registryvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRegistryvaultizabilityAdminRecords,
  buildRegistryvaultizabilityAdminStats,
  getRegistryvaultizabilityAdminGuidance,
  resolveRegistryvaultizabilityAdminActions,
} from './registryvaultizability-admin.helpers.js'
import { evaluateRegistryvaultizabilityRollout } from './registryvaultizability-rollout.helpers.js'
import { RegistryvaultizabilityStatusService } from './registryvaultizability-status.service.js'

@Injectable()
export class RegistryvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly registryvaultizabilityStatusService: RegistryvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return registryvaultizabilityCapabilitiesResponseSchema.parse({
      supportsRegistryvaultizabilityRollout: true,
      supportsRegistryvaultizabilityAdminTools: true,
      supportsBillingInvoiceRegistryvaultizabilitySignals: true,
      supportsBillingRecordRegistryvaultizabilitySignals: true,
      guidance: getRegistryvaultizabilityRolloutGuidance(),
    })
  }

  async getRegistryvaultizabilityRollout() {
    const registryvaultizabilityTableCoverage =
      await this.registryvaultizabilityStatusService.getRegistryvaultizabilityTableCoverage()

    const rollout = evaluateRegistryvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.registryvaultizabilityStatusService.pingPostgres(),
      existingRegistryvaultizabilityTableCount: registryvaultizabilityTableCoverage.existingRegistryvaultizabilityTableCount,
      billingInvoicesTableExists: registryvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: registryvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: registryvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return registryvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRegistryvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRegistryvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.registryvaultizabilityStatusService.getWorkspaceRegistryvaultizabilityInventory(
        workspaceId,
      )
    const records = buildRegistryvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.registryvaultizabilityStatusService.pingPostgres()
    const stats = buildRegistryvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return registryvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRegistryvaultizabilityAdminActions(),
      guidance: getRegistryvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeRegistryvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_registryvaultizability_summary'
    },
  ) {
    this.assertCanManageRegistryvaultizability(authContext)

    const payload = registryvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_registryvaultizability_summary': {
        const summary = await this.getWorkspaceRegistryvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return registryvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed registryvaultizability summary with ${summary.stats.registryvaultizabilityPercent}% billing invoice registryvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRegistryvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production registryvaultizability tools.',
    })
  }
}
