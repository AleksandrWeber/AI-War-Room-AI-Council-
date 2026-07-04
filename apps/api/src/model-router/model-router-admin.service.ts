import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getModelRouterGuidance,
  modelHealthAdminActionRequestSchema,
  modelHealthAdminActionResponseSchema,
  modelHealthAdminSummaryResponseSchema,
  modelRouterCapabilitiesResponseSchema,
  modelRouterRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildModelHealthAdminStats,
  getModelHealthAdminGuidance,
  resolveModelHealthAdminActions,
  toModelHealthAdminRecord,
} from './model-health-admin.helpers.js'
import { evaluateModelRouterRollout } from './model-router-rollout.helpers.js'
import { ModelRouterService } from './model-router.service.js'

@Injectable()
export class ModelRouterAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly modelRouterService: ModelRouterService,
  ) {}

  getCapabilities() {
    const llmPrimaryProvider = this.configService.get('LLM_PRIMARY_PROVIDER', {
      infer: true,
    })
    const llmFallbackProvider = this.configService.get('LLM_FALLBACK_PROVIDER', {
      infer: true,
    })

    return modelRouterCapabilitiesResponseSchema.parse({
      llmPrimaryProvider,
      llmFallbackProvider,
      supportsModelRouterRollout: true,
      supportsModelHealthAdminTools: true,
      guidance: getModelRouterGuidance({
        llmPrimaryProvider,
        llmFallbackProvider,
      }),
    })
  }

  async getModelRouterRollout() {
    const models = await this.modelRouterService.getRegistrySnapshot()
    const llmPrimaryProvider = this.configService.get('LLM_PRIMARY_PROVIDER', {
      infer: true,
    })
    const llmFallbackProvider = this.configService.get('LLM_FALLBACK_PROVIDER', {
      infer: true,
    })
    const rollout = evaluateModelRouterRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      llmPrimaryProvider,
      llmFallbackProvider,
      models,
    })

    return modelRouterRolloutResponseSchema.parse({
      ...rollout,
      llmPrimaryProvider,
      llmFallbackProvider,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceModelHealthAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageModelHealth(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const models = (await this.modelRouterService.getRegistrySnapshot()).map(
      toModelHealthAdminRecord,
    )
    const availableActions = resolveModelHealthAdminActions({ models })

    return modelHealthAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      models,
      stats: buildModelHealthAdminStats(models),
      availableActions,
      guidance: getModelHealthAdminGuidance({ availableActions }),
    })
  }

  async executeModelHealthAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'recover_model'
      modelId: string
    },
  ) {
    this.assertCanManageModelHealth(authContext)

    const payload = modelHealthAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
      modelId: input.modelId,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'recover_model': {
        const recovered = await this.modelRouterService.recoverModel(
          payload.modelId,
          'workspace_admin_recovery',
        )

        if (!recovered) {
          throw new NotFoundException({
            message: 'Model was not found in the registry.',
          })
        }

        return modelHealthAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Recovered ${recovered.modelId} to healthy routing state.`,
          model: toModelHealthAdminRecord(recovered),
        })
      }
    }
  }

  async recoverModelAsAdmin(authContext: AuthContext, modelId: string) {
    this.assertCanManageModelHealth(authContext)

    const recovered = await this.modelRouterService.recoverModel(
      modelId,
      'workspace_admin_recovery',
    )

    if (!recovered) {
      throw new NotFoundException({
        message: 'Model was not found in the registry.',
      })
    }

    return recovered
  }

  private assertCanManageModelHealth(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message: 'Only workspace owners and admins can manage model health.',
    })
  }
}
