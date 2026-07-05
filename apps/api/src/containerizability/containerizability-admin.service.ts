import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getContainerizabilityRolloutGuidance,
  containerizabilityAdminActionRequestSchema,
  containerizabilityAdminActionResponseSchema,
  containerizabilityAdminSummaryResponseSchema,
  containerizabilityCapabilitiesResponseSchema,
  containerizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildContainerizabilityAdminRecords,
  buildContainerizabilityAdminStats,
  getContainerizabilityAdminGuidance,
  resolveContainerizabilityAdminActions,
} from './containerizability-admin.helpers.js'
import { evaluateContainerizabilityRollout } from './containerizability-rollout.helpers.js'
import { ContainerizabilityStatusService } from './containerizability-status.service.js'

@Injectable()
export class ContainerizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly containerizabilityStatusService: ContainerizabilityStatusService,
  ) {}

  getCapabilities() {
    return containerizabilityCapabilitiesResponseSchema.parse({
      supportsContainerizabilityRollout: true,
      supportsContainerizabilityAdminTools: true,
      supportsBillingInvoiceContainerizabilitySignals: true,
      supportsBillingRecordContainerizabilitySignals: true,
      guidance: getContainerizabilityRolloutGuidance(),
    })
  }

  async getContainerizabilityRollout() {
    const containerizabilityTableCoverage =
      await this.containerizabilityStatusService.getContainerizabilityTableCoverage()

    const rollout = evaluateContainerizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.containerizabilityStatusService.pingPostgres(),
      existingContainerizabilityTableCount: containerizabilityTableCoverage.existingContainerizabilityTableCount,
      billingInvoicesTableExists: containerizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: containerizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: containerizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return containerizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceContainerizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageContainerizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.containerizabilityStatusService.getWorkspaceContainerizabilityInventory(
        workspaceId,
      )
    const records = buildContainerizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.containerizabilityStatusService.pingPostgres()
    const stats = buildContainerizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return containerizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveContainerizabilityAdminActions(),
      guidance: getContainerizabilityAdminGuidance({ stats }),
    })
  }

  async executeContainerizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_containerizability_summary'
    },
  ) {
    this.assertCanManageContainerizability(authContext)

    const payload = containerizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_containerizability_summary': {
        const summary = await this.getWorkspaceContainerizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return containerizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed containerizability summary with ${summary.stats.containerizabilityPercent}% billing invoice containerizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageContainerizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production containerizability tools.',
    })
  }
}
