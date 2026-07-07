import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getModifiabilityvaultizabilityRolloutGuidance,
  modifiabilityvaultizabilityAdminActionRequestSchema,
  modifiabilityvaultizabilityAdminActionResponseSchema,
  modifiabilityvaultizabilityAdminSummaryResponseSchema,
  modifiabilityvaultizabilityCapabilitiesResponseSchema,
  modifiabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildModifiabilityvaultizabilityAdminRecords,
  buildModifiabilityvaultizabilityAdminStats,
  getModifiabilityvaultizabilityAdminGuidance,
  resolveModifiabilityvaultizabilityAdminActions,
} from './modifiabilityvaultizability-admin.helpers.js'
import { evaluateModifiabilityvaultizabilityRollout } from './modifiabilityvaultizability-rollout.helpers.js'
import { ModifiabilityvaultizabilityStatusService } from './modifiabilityvaultizability-status.service.js'

@Injectable()
export class ModifiabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly modifiabilityvaultizabilityStatusService: ModifiabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return modifiabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsModifiabilityvaultizabilityRollout: true,
      supportsModifiabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationModifiabilityvaultizabilitySignals: true,
      supportsBillingWebhookModifiabilityvaultizabilitySignals: true,
      guidance: getModifiabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getModifiabilityvaultizabilityRollout() {
    const modifiabilityvaultizabilityTableCoverage =
      await this.modifiabilityvaultizabilityStatusService.getModifiabilityvaultizabilityTableCoverage()

    const rollout = evaluateModifiabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.modifiabilityvaultizabilityStatusService.pingPostgres(),
      existingModifiabilityvaultizabilityTableCount: modifiabilityvaultizabilityTableCoverage.existingModifiabilityvaultizabilityTableCount,
      billingNotificationsTableExists: modifiabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: modifiabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: modifiabilityvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return modifiabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceModifiabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageModifiabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.modifiabilityvaultizabilityStatusService.getWorkspaceModifiabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildModifiabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.modifiabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildModifiabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return modifiabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveModifiabilityvaultizabilityAdminActions(),
      guidance: getModifiabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeModifiabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_modifiabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageModifiabilityvaultizability(authContext)

    const payload = modifiabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_modifiabilityvaultizability_summary': {
        const summary = await this.getWorkspaceModifiabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return modifiabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed modifiabilityvaultizability summary with ${summary.stats.modifiabilityvaultizabilityPercent}% billing notification modifiabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageModifiabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production modifiabilityvaultizability tools.',
    })
  }
}
