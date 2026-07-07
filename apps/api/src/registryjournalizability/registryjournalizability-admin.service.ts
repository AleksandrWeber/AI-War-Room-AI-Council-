import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRegistryjournalizabilityRolloutGuidance,
  registryjournalizabilityAdminActionRequestSchema,
  registryjournalizabilityAdminActionResponseSchema,
  registryjournalizabilityAdminSummaryResponseSchema,
  registryjournalizabilityCapabilitiesResponseSchema,
  registryjournalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRegistryjournalizabilityAdminRecords,
  buildRegistryjournalizabilityAdminStats,
  getRegistryjournalizabilityAdminGuidance,
  resolveRegistryjournalizabilityAdminActions,
} from './registryjournalizability-admin.helpers.js'
import { evaluateRegistryjournalizabilityRollout } from './registryjournalizability-rollout.helpers.js'
import { RegistryjournalizabilityStatusService } from './registryjournalizability-status.service.js'

@Injectable()
export class RegistryjournalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly registryjournalizabilityStatusService: RegistryjournalizabilityStatusService,
  ) {}

  getCapabilities() {
    return registryjournalizabilityCapabilitiesResponseSchema.parse({
      supportsRegistryjournalizabilityRollout: true,
      supportsRegistryjournalizabilityAdminTools: true,
      supportsBillingInvoiceRegistryjournalizabilitySignals: true,
      supportsBillingRecordRegistryjournalizabilitySignals: true,
      guidance: getRegistryjournalizabilityRolloutGuidance(),
    })
  }

  async getRegistryjournalizabilityRollout() {
    const registryjournalizabilityTableCoverage =
      await this.registryjournalizabilityStatusService.getRegistryjournalizabilityTableCoverage()

    const rollout = evaluateRegistryjournalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.registryjournalizabilityStatusService.pingPostgres(),
      existingRegistryjournalizabilityTableCount: registryjournalizabilityTableCoverage.existingRegistryjournalizabilityTableCount,
      billingInvoicesTableExists: registryjournalizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: registryjournalizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: registryjournalizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return registryjournalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRegistryjournalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRegistryjournalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.registryjournalizabilityStatusService.getWorkspaceRegistryjournalizabilityInventory(
        workspaceId,
      )
    const records = buildRegistryjournalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.registryjournalizabilityStatusService.pingPostgres()
    const stats = buildRegistryjournalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return registryjournalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRegistryjournalizabilityAdminActions(),
      guidance: getRegistryjournalizabilityAdminGuidance({ stats }),
    })
  }

  async executeRegistryjournalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_registryjournalizability_summary'
    },
  ) {
    this.assertCanManageRegistryjournalizability(authContext)

    const payload = registryjournalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_registryjournalizability_summary': {
        const summary = await this.getWorkspaceRegistryjournalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return registryjournalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed registryjournalizability summary with ${summary.stats.registryjournalizabilityPercent}% billing invoice registryjournalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRegistryjournalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production registryjournalizability tools.',
    })
  }
}
