import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRegistryizabilityRolloutGuidance,
  registryizabilityAdminActionRequestSchema,
  registryizabilityAdminActionResponseSchema,
  registryizabilityAdminSummaryResponseSchema,
  registryizabilityCapabilitiesResponseSchema,
  registryizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRegistryizabilityAdminRecords,
  buildRegistryizabilityAdminStats,
  getRegistryizabilityAdminGuidance,
  resolveRegistryizabilityAdminActions,
} from './registryizability-admin.helpers.js'
import { evaluateRegistryizabilityRollout } from './registryizability-rollout.helpers.js'
import { RegistryizabilityStatusService } from './registryizability-status.service.js'

@Injectable()
export class RegistryizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly registryizabilityStatusService: RegistryizabilityStatusService,
  ) {}

  getCapabilities() {
    return registryizabilityCapabilitiesResponseSchema.parse({
      supportsRegistryizabilityRollout: true,
      supportsRegistryizabilityAdminTools: true,
      supportsBillingNotificationRegistryizabilitySignals: true,
      supportsBillingWebhookRegistryizabilitySignals: true,
      guidance: getRegistryizabilityRolloutGuidance(),
    })
  }

  async getRegistryizabilityRollout() {
    const registryizabilityTableCoverage =
      await this.registryizabilityStatusService.getRegistryizabilityTableCoverage()

    const rollout = evaluateRegistryizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.registryizabilityStatusService.pingPostgres(),
      existingRegistryizabilityTableCount: registryizabilityTableCoverage.existingRegistryizabilityTableCount,
      billingNotificationsTableExists: registryizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: registryizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: registryizabilityTableCoverage.usageEventsTableExists,
    })

    return registryizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRegistryizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRegistryizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.registryizabilityStatusService.getWorkspaceRegistryizabilityInventory(
        workspaceId,
      )
    const records = buildRegistryizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.registryizabilityStatusService.pingPostgres()
    const stats = buildRegistryizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return registryizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRegistryizabilityAdminActions(),
      guidance: getRegistryizabilityAdminGuidance({ stats }),
    })
  }

  async executeRegistryizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_registryizability_summary'
    },
  ) {
    this.assertCanManageRegistryizability(authContext)

    const payload = registryizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_registryizability_summary': {
        const summary = await this.getWorkspaceRegistryizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return registryizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed registryizability summary with ${summary.stats.registryizabilityPercent}% billing notification registryizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRegistryizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production registryizability tools.',
    })
  }
}
