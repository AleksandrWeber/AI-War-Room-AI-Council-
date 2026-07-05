import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTransferabilityRolloutGuidance,
  transferabilityAdminActionRequestSchema,
  transferabilityAdminActionResponseSchema,
  transferabilityAdminSummaryResponseSchema,
  transferabilityCapabilitiesResponseSchema,
  transferabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTransferabilityAdminRecords,
  buildTransferabilityAdminStats,
  getTransferabilityAdminGuidance,
  resolveTransferabilityAdminActions,
} from './transferability-admin.helpers.js'
import { evaluateTransferabilityRollout } from './transferability-rollout.helpers.js'
import { TransferabilityStatusService } from './transferability-status.service.js'

@Injectable()
export class TransferabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly transferabilityStatusService: TransferabilityStatusService,
  ) {}

  getCapabilities() {
    return transferabilityCapabilitiesResponseSchema.parse({
      supportsTransferabilityRollout: true,
      supportsTransferabilityAdminTools: true,
      supportsBillingRecordTransferabilitySignals: true,
      supportsBillingInvoiceTransferabilitySignals: true,
      guidance: getTransferabilityRolloutGuidance(),
    })
  }

  async getTransferabilityRollout() {
    const transferabilityTableCoverage =
      await this.transferabilityStatusService.getTransferabilityTableCoverage()

    const rollout = evaluateTransferabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.transferabilityStatusService.pingPostgres(),
      existingTransferabilityTableCount: transferabilityTableCoverage.existingTransferabilityTableCount,
      billingRecordsTableExists: transferabilityTableCoverage.billingRecordsTableExists,
      billingInvoicesTableExists: transferabilityTableCoverage.billingInvoicesTableExists,
      billingNotificationsTableExists: transferabilityTableCoverage.billingNotificationsTableExists,
    })

    return transferabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTransferabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTransferability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.transferabilityStatusService.getWorkspaceTransferabilityInventory(
        workspaceId,
      )
    const records = buildTransferabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.transferabilityStatusService.pingPostgres()
    const stats = buildTransferabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return transferabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTransferabilityAdminActions(),
      guidance: getTransferabilityAdminGuidance({ stats }),
    })
  }

  async executeTransferabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_transferability_summary'
    },
  ) {
    this.assertCanManageTransferability(authContext)

    const payload = transferabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_transferability_summary': {
        const summary = await this.getWorkspaceTransferabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return transferabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed transferability summary with ${summary.stats.transferabilityPercent}% billing record transferability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTransferability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production transferability tools.',
    })
  }
}
