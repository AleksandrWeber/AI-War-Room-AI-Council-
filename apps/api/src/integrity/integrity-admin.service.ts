import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIntegrityRolloutGuidance,
  integrityAdminActionRequestSchema,
  integrityAdminActionResponseSchema,
  integrityAdminSummaryResponseSchema,
  integrityCapabilitiesResponseSchema,
  integrityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIntegrityAdminRecords,
  buildIntegrityAdminStats,
  getIntegrityAdminGuidance,
  resolveIntegrityAdminActions,
} from './integrity-admin.helpers.js'
import {
  evaluateIntegrityRollout,
  isProductionEncryptionKeyConfigured,
} from './integrity-rollout.helpers.js'
import { IntegrityStatusService } from './integrity-status.service.js'

@Injectable()
export class IntegrityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly integrityStatusService: IntegrityStatusService,
  ) {}

  getCapabilities() {
    return integrityCapabilitiesResponseSchema.parse({
      supportsIntegrityRollout: true,
      supportsIntegrityAdminTools: true,
      supportsArtifactIntegritySignals: true,
      supportsShieldScanIntegritySignals: true,
      guidance: getIntegrityRolloutGuidance(),
    })
  }

  async getIntegrityRollout() {
    const integrityTableCoverage =
      await this.integrityStatusService.getIntegrityTableCoverage()

    const rollout = evaluateIntegrityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.integrityStatusService.pingPostgres(),
      existingIntegrityTableCount:
        integrityTableCoverage.existingIntegrityTableCount,
      artifactsTableExists: integrityTableCoverage.artifactsTableExists,
      shieldScansTableExists: integrityTableCoverage.shieldScansTableExists,
      encryptionKeyConfigured: isProductionEncryptionKeyConfigured(
        this.configService.get('APP_ENCRYPTION_KEY', { infer: true }),
      ),
    })

    return integrityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIntegrityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIntegrity(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.integrityStatusService.getWorkspaceIntegrityInventory(
        workspaceId,
      )
    const records = buildIntegrityAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.integrityStatusService.pingPostgres()
    const stats = buildIntegrityAdminStats({
      records,
      postgresConnectivity,
    })

    return integrityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIntegrityAdminActions(),
      guidance: getIntegrityAdminGuidance({ stats }),
    })
  }

  async executeIntegrityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_integrity_summary'
    },
  ) {
    this.assertCanManageIntegrity(authContext)

    const payload = integrityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_integrity_summary': {
        const summary = await this.getWorkspaceIntegrityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return integrityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed integrity summary with ${summary.stats.integrityPercent}% run integrity across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIntegrity(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production integrity tools.',
    })
  }
}
