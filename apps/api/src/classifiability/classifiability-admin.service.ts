import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getClassifiabilityRolloutGuidance,
  classifiabilityAdminActionRequestSchema,
  classifiabilityAdminActionResponseSchema,
  classifiabilityAdminSummaryResponseSchema,
  classifiabilityCapabilitiesResponseSchema,
  classifiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildClassifiabilityAdminRecords,
  buildClassifiabilityAdminStats,
  getClassifiabilityAdminGuidance,
  resolveClassifiabilityAdminActions,
} from './classifiability-admin.helpers.js'
import { evaluateClassifiabilityRollout } from './classifiability-rollout.helpers.js'
import { ClassifiabilityStatusService } from './classifiability-status.service.js'

@Injectable()
export class ClassifiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly classifiabilityStatusService: ClassifiabilityStatusService,
  ) {}

  getCapabilities() {
    return classifiabilityCapabilitiesResponseSchema.parse({
      supportsClassifiabilityRollout: true,
      supportsClassifiabilityAdminTools: true,
      supportsIdempotencyKeyClassifiabilitySignals: true,
      supportsUsageEventClassifiabilitySignals: true,
      guidance: getClassifiabilityRolloutGuidance(),
    })
  }

  async getClassifiabilityRollout() {
    const classifiabilityTableCoverage =
      await this.classifiabilityStatusService.getClassifiabilityTableCoverage()

    const rollout = evaluateClassifiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.classifiabilityStatusService.pingPostgres(),
      existingClassifiabilityTableCount: classifiabilityTableCoverage.existingClassifiabilityTableCount,
      idempotencyKeysTableExists: classifiabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: classifiabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: classifiabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return classifiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceClassifiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageClassifiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.classifiabilityStatusService.getWorkspaceClassifiabilityInventory(
        workspaceId,
      )
    const records = buildClassifiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.classifiabilityStatusService.pingPostgres()
    const stats = buildClassifiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return classifiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveClassifiabilityAdminActions(),
      guidance: getClassifiabilityAdminGuidance({ stats }),
    })
  }

  async executeClassifiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_classifiability_summary'
    },
  ) {
    this.assertCanManageClassifiability(authContext)

    const payload = classifiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_classifiability_summary': {
        const summary = await this.getWorkspaceClassifiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return classifiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed classifiability summary with ${summary.stats.classifiabilityPercent}% idempotency key classifiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageClassifiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production classifiability tools.',
    })
  }
}
