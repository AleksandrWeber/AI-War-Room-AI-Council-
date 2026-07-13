import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import {
  type ModelRegistryEntry,
  type ModelRouterRole,
  type ModelSelectionDecision,
  modelSelectionDecisionSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import {
  MODEL_REGISTRY_REPOSITORY,
  type ModelRegistryRepository,
} from './model-registry.repository.js'
import { createDefaultModelRegistry } from './model-router.defaults.js'

const artifactRoles: ModelRouterRole[] = [
  'moderator',
  'executive_summary',
  'prd',
  'development_prompt',
]

const safetyRoles: ModelRouterRole[] = ['security_expert', 'shield_classifier']

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

@Injectable()
export class ModelRouterService implements OnModuleInit {
  private initialized: Promise<void> | null = null

  constructor(
    private readonly observabilityService: ObservabilityService,
    @Inject(MODEL_REGISTRY_REPOSITORY)
    private readonly modelRegistryRepository: ModelRegistryRepository,
    @Optional()
    private readonly configService?: ConfigService<ApiEnv, true>,
  ) {}

  async onModuleInit() {
    await this.ensureInitialized()
  }

  async selectModel(input: {
    taskName: string
    role: ModelRouterRole
    forceDeputy?: boolean
  }): Promise<ModelSelectionDecision> {
    const ranked = await this.getRankedCandidates(input.role)
    const champion = ranked[0]
    const deputy = ranked[1]
    const selected = input.forceDeputy && deputy ? deputy : champion

    if (!champion || !selected) {
      throw new Error(
        `No active model is available for role "${input.role}". Recover degraded providers or set LLM_PRIMARY_PROVIDER to an active model.`,
      )
    }

    const decision = modelSelectionDecisionSchema.parse({
      decisionId: createId('model_decision'),
      taskName: input.taskName,
      role: input.role,
      champion,
      deputy,
      selected,
      selectionReason:
        input.forceDeputy && deputy
          ? 'deputy_selected_after_champion_failure'
          : 'champion_selected_by_role_score',
      candidateCount: ranked.length,
      createdAt: new Date().toISOString(),
    })

    this.observabilityService.record('model_router_selection', {
      decisionId: decision.decisionId,
      taskName: decision.taskName,
      role: decision.role,
      selectedModelId: decision.selected.modelId,
      championModelId: decision.champion.modelId,
      deputyModelId: decision.deputy?.modelId ?? null,
      selectionReason: decision.selectionReason,
      candidateCount: decision.candidateCount,
    })

    return decision
  }

  async markModelDegraded(modelId: string, reason = 'provider_failure') {
    await this.ensureInitialized()
    const degraded = await this.modelRegistryRepository.markModelDegraded({
      eventId: createId('model_health_event'),
      modelId,
      reason,
      now: new Date().toISOString(),
    })

    if (degraded) {
      this.observabilityService.record(
        'model_router_model_degraded',
        {
          modelId: degraded.modelId,
          providerId: degraded.providerId,
          modelName: degraded.modelName,
          reason,
          consecutiveFailures: degraded.consecutiveFailures,
        },
        'warn',
      )
    }
  }

  async recoverModel(modelId: string, reason = 'manual_recovery') {
    await this.ensureInitialized()
    const recovered = await this.modelRegistryRepository.recoverModel({
      eventId: createId('model_health_event'),
      modelId,
      reason,
      now: new Date().toISOString(),
    })

    if (recovered) {
      this.observabilityService.record('model_router_model_recovered', {
        modelId: recovered.modelId,
        providerId: recovered.providerId,
        modelName: recovered.modelName,
        reason,
      })
    }

    return recovered
  }

  async getRegistrySnapshot() {
    await this.ensureInitialized()

    return this.modelRegistryRepository.listModels()
  }

  async getHealthEvents(modelId: string) {
    await this.ensureInitialized()

    return this.modelRegistryRepository.listHealthEvents(modelId)
  }

  private async getRankedCandidates(role: ModelRouterRole) {
    await this.ensureInitialized()
    const models = await this.modelRegistryRepository.listModels()

    return models
      .filter((model) => {
        return (
          model.supportedRoles.includes(role) &&
          model.lifecycleStatus === 'active' &&
          model.healthStatus === 'healthy'
        )
      })
      .map((model) => ({
        modelId: model.modelId,
        providerId: model.providerId,
        modelName: model.modelName,
        score: this.scoreModel(model, role),
        lifecycleStatus: model.lifecycleStatus,
        healthStatus: model.healthStatus,
      }))
      .sort((left, right) => right.score - left.score)
  }

  private scoreModel(model: ModelRegistryEntry, role: ModelRouterRole) {
    const costEfficiency = 1 / (1 + model.inputCostPerMillionTokensUsd)
    const latencyScore = 1 / (1 + model.latencyP95Ms / 10_000)
    const weights = this.getWeights(role)
    const primaryProvider = this.configService?.get('LLM_PRIMARY_PROVIDER', {
      infer: true,
    })
    const fallbackProvider = this.configService?.get('LLM_FALLBACK_PROVIDER', {
      infer: true,
    })
    const providerPreference =
      model.providerId === primaryProvider
        ? 1
        : model.providerId === fallbackProvider
          ? 0.35
          : 0

    return (
      model.evaluationScore * weights.evaluation +
      model.safetyScore * weights.safety +
      model.reliabilityScore * weights.reliability +
      costEfficiency * weights.cost +
      latencyScore * weights.latency +
      providerPreference
    )
  }

  private getWeights(role: ModelRouterRole) {
    if (safetyRoles.includes(role)) {
      return {
        evaluation: 0.25,
        safety: 0.4,
        reliability: 0.2,
        cost: 0.05,
        latency: 0.1,
      }
    }

    if (artifactRoles.includes(role)) {
      return {
        evaluation: 0.45,
        safety: 0.15,
        reliability: 0.2,
        cost: 0.05,
        latency: 0.15,
      }
    }

    return {
      evaluation: 0.3,
      safety: 0.15,
      reliability: 0.2,
      cost: 0.15,
      latency: 0.2,
    }
  }

  private async ensureInitialized() {
    this.initialized ??= this.modelRegistryRepository.ensureDefaultModels(
      createDefaultModelRegistry(this.configService),
    )

    await this.initialized
  }
}
