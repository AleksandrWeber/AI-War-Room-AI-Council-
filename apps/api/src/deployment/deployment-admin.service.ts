import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  criticalDeploymentDependencies,
  deploymentAdminActionRequestSchema,
  deploymentAdminActionResponseSchema,
  deploymentAdminSummaryResponseSchema,
  deploymentCapabilitiesResponseSchema,
  deploymentRolloutResponseSchema,
  getDeploymentRolloutGuidance,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { HealthService } from '../health/health.service.js'
import { ReadinessService } from '../health/readiness.service.js'
import {
  buildDeploymentAdminStats,
  getDeploymentAdminGuidance,
  resolveDeploymentAdminActions,
} from './deployment-admin.helpers.js'
import { evaluateDeploymentRollout } from './deployment-rollout.helpers.js'

@Injectable()
export class DeploymentAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly healthService: HealthService,
    private readonly readinessService: ReadinessService,
  ) {}

  getCapabilities() {
    return deploymentCapabilitiesResponseSchema.parse({
      supportsDeploymentRollout: true,
      supportsDeploymentAdminTools: true,
      supportsApiReadinessProbe: true,
      supportedDependencies: [...criticalDeploymentDependencies],
      guidance: getDeploymentRolloutGuidance(),
    })
  }

  async getDeploymentRollout() {
    const readiness = await this.readinessService.getReadiness()
    const rollout = evaluateDeploymentRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      readinessStatus: readiness.status,
      dependencies: readiness.dependencies,
      webOrigin: this.configService.get('WEB_ORIGIN', { infer: true }),
      supportsApiHealthEndpoint: this.healthService.getStatus().status === 'ok',
      supportsApiReadinessProbe: true,
    })

    return deploymentRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDeploymentAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDeployment(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const readiness = await this.readinessService.getReadiness()
    const stats = buildDeploymentAdminStats({
      readiness,
      apiVersion: this.healthService.getStatus().version,
    })

    return deploymentAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      readinessStatus: readiness.status,
      dependencies: readiness.dependencies,
      stats,
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      webOrigin: this.configService.get('WEB_ORIGIN', { infer: true }),
      checkedAt: readiness.checkedAt,
      availableActions: resolveDeploymentAdminActions(),
      guidance: getDeploymentAdminGuidance({ stats }),
    })
  }

  async executeDeploymentAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_deployment_summary'
    },
  ) {
    this.assertCanManageDeployment(authContext)

    const payload = deploymentAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_deployment_summary': {
        const summary = await this.getWorkspaceDeploymentAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return deploymentAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed deployment summary with ${summary.stats.healthyDependencyCount}/${summary.stats.totalDependencies} healthy dependencies.`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDeployment(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage deployment health tools.',
    })
  }
}
