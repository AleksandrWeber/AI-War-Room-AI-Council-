import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInventoryizabilityRolloutGuidance,
  inventoryizabilityAdminActionRequestSchema,
  inventoryizabilityAdminActionResponseSchema,
  inventoryizabilityAdminSummaryResponseSchema,
  inventoryizabilityCapabilitiesResponseSchema,
  inventoryizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInventoryizabilityAdminRecords,
  buildInventoryizabilityAdminStats,
  getInventoryizabilityAdminGuidance,
  resolveInventoryizabilityAdminActions,
} from './inventoryizability-admin.helpers.js'
import { evaluateInventoryizabilityRollout } from './inventoryizability-rollout.helpers.js'
import { InventoryizabilityStatusService } from './inventoryizability-status.service.js'

@Injectable()
export class InventoryizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly inventoryizabilityStatusService: InventoryizabilityStatusService,
  ) {}

  getCapabilities() {
    return inventoryizabilityCapabilitiesResponseSchema.parse({
      supportsInventoryizabilityRollout: true,
      supportsInventoryizabilityAdminTools: true,
      supportsBillingInvoiceInventoryizabilitySignals: true,
      supportsBillingRecordInventoryizabilitySignals: true,
      guidance: getInventoryizabilityRolloutGuidance(),
    })
  }

  async getInventoryizabilityRollout() {
    const inventoryizabilityTableCoverage =
      await this.inventoryizabilityStatusService.getInventoryizabilityTableCoverage()

    const rollout = evaluateInventoryizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.inventoryizabilityStatusService.pingPostgres(),
      existingInventoryizabilityTableCount: inventoryizabilityTableCoverage.existingInventoryizabilityTableCount,
      billingInvoicesTableExists: inventoryizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: inventoryizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: inventoryizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return inventoryizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInventoryizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInventoryizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.inventoryizabilityStatusService.getWorkspaceInventoryizabilityInventory(
        workspaceId,
      )
    const records = buildInventoryizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.inventoryizabilityStatusService.pingPostgres()
    const stats = buildInventoryizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return inventoryizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInventoryizabilityAdminActions(),
      guidance: getInventoryizabilityAdminGuidance({ stats }),
    })
  }

  async executeInventoryizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_inventoryizability_summary'
    },
  ) {
    this.assertCanManageInventoryizability(authContext)

    const payload = inventoryizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_inventoryizability_summary': {
        const summary = await this.getWorkspaceInventoryizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return inventoryizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed inventoryizability summary with ${summary.stats.inventoryizabilityPercent}% billing invoice inventoryizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInventoryizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production inventoryizability tools.',
    })
  }
}
