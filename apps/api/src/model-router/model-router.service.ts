import { Injectable, Optional } from '@nestjs/common'
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

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

const allRoles: ModelRouterRole[] = [
  'triage',
  'product_manager',
  'critic',
  'moderator',
  'security_expert',
  'software_architect',
  'market_researcher',
  'mobile_ux_expert',
  'executive_summary',
  'prd',
  'development_prompt',
  'shield_classifier',
]

const artifactRoles: ModelRouterRole[] = [
  'moderator',
  'executive_summary',
  'prd',
  'development_prompt',
]

const safetyRoles: ModelRouterRole[] = ['security_expert', 'shield_classifier']

@Injectable()
export class ModelRouterService {
  private readonly registry = new Map<string, ModelRegistryEntry>()

  constructor(
    private readonly observabilityService: ObservabilityService,
    @Optional()
    private readonly configService?: ConfigService<ApiEnv, true>,
  ) {
    for (const model of this.createDefaultRegistry()) {
      this.registry.set(model.modelId, model)
    }
  }

  selectModel(input: {
    taskName: string
    role: ModelRouterRole
    forceDeputy?: boolean
  }): ModelSelectionDecision {
    const ranked = this.getRankedCandidates(input.role)
    const champion = ranked[0]
    const deputy = ranked[1]
    const selected = input.forceDeputy && deputy ? deputy : champion

    if (!champion || !selected) {
      throw new Error(`No active model is available for role "${input.role}".`)
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

  markModelDegraded(modelId: string) {
    const model = this.registry.get(modelId)

    if (!model) {
      return
    }

    this.registry.set(modelId, {
      ...model,
      lifecycleStatus: 'degraded',
      healthStatus: 'degraded',
      consecutiveFailures: model.consecutiveFailures + 1,
      updatedAt: new Date().toISOString(),
    })
  }

  getRegistrySnapshot() {
    return [...this.registry.values()]
  }

  private getRankedCandidates(role: ModelRouterRole) {
    return [...this.registry.values()]
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

    return (
      model.evaluationScore * weights.evaluation +
      model.safetyScore * weights.safety +
      model.reliabilityScore * weights.reliability +
      costEfficiency * weights.cost +
      latencyScore * weights.latency
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

  private createDefaultRegistry(): ModelRegistryEntry[] {
    const now = new Date().toISOString()
    const anthropicStatus = this.resolveConfiguredProviderStatus('anthropic')
    const openAiStatus = this.resolveConfiguredProviderStatus('openai')

    return [
      {
        modelId: 'mock-json-v1-primary',
        providerId: 'mock',
        modelName: 'mock-json-v1',
        supportedRoles: allRoles,
        contextWindowTokens: 128_000,
        maxOutputTokens: 8_192,
        inputCostPerMillionTokensUsd: 0,
        outputCostPerMillionTokensUsd: 0,
        latencyP95Ms: 500,
        evaluationScore: 0.88,
        safetyScore: 0.85,
        reliabilityScore: 0.98,
        lifecycleStatus: 'active',
        healthStatus: 'healthy',
        consecutiveFailures: 0,
        updatedAt: now,
      },
      {
        modelId: 'mock-json-v1-deputy',
        providerId: 'mock',
        modelName: 'mock-json-v1-deputy',
        supportedRoles: allRoles,
        contextWindowTokens: 128_000,
        maxOutputTokens: 8_192,
        inputCostPerMillionTokensUsd: 0,
        outputCostPerMillionTokensUsd: 0,
        latencyP95Ms: 650,
        evaluationScore: 0.82,
        safetyScore: 0.82,
        reliabilityScore: 0.96,
        lifecycleStatus: 'active',
        healthStatus: 'healthy',
        consecutiveFailures: 0,
        updatedAt: now,
      },
      {
        modelId: 'mock-json-v2-candidate',
        providerId: 'mock',
        modelName: 'mock-json-v2-candidate',
        supportedRoles: allRoles,
        contextWindowTokens: 128_000,
        maxOutputTokens: 8_192,
        inputCostPerMillionTokensUsd: 0,
        outputCostPerMillionTokensUsd: 0,
        latencyP95Ms: 350,
        evaluationScore: 0.99,
        safetyScore: 0.99,
        reliabilityScore: 0.99,
        lifecycleStatus: 'candidate',
        healthStatus: 'healthy',
        consecutiveFailures: 0,
        updatedAt: now,
      },
      {
        modelId: 'anthropic-sonnet-candidate',
        providerId: 'anthropic',
        modelName: this.resolveConfiguredModel(
          'anthropic',
          'claude-3-5-sonnet-latest',
        ),
        supportedRoles: allRoles,
        contextWindowTokens: 200_000,
        maxOutputTokens: 8_192,
        inputCostPerMillionTokensUsd: 3,
        outputCostPerMillionTokensUsd: 15,
        latencyP95Ms: 2_500,
        evaluationScore: 0.94,
        safetyScore: 0.92,
        reliabilityScore: 0.92,
        lifecycleStatus: anthropicStatus,
        healthStatus: 'healthy',
        consecutiveFailures: 0,
        updatedAt: now,
      },
      {
        modelId: 'openai-fast-candidate',
        providerId: 'openai',
        modelName: this.resolveConfiguredModel('openai', 'gpt-4o-mini'),
        supportedRoles: allRoles,
        contextWindowTokens: 128_000,
        maxOutputTokens: 16_384,
        inputCostPerMillionTokensUsd: 0.15,
        outputCostPerMillionTokensUsd: 0.6,
        latencyP95Ms: 1_200,
        evaluationScore: 0.86,
        safetyScore: 0.84,
        reliabilityScore: 0.9,
        lifecycleStatus: openAiStatus,
        healthStatus: 'healthy',
        consecutiveFailures: 0,
        updatedAt: now,
      },
    ]
  }

  private resolveConfiguredProviderStatus(
    providerId: 'anthropic' | 'openai',
  ): ModelRegistryEntry['lifecycleStatus'] {
    const primaryProvider = this.configService?.get('LLM_PRIMARY_PROVIDER', {
      infer: true,
    })
    const fallbackProvider = this.configService?.get('LLM_FALLBACK_PROVIDER', {
      infer: true,
    })

    return primaryProvider === providerId || fallbackProvider === providerId
      ? 'active'
      : 'candidate'
  }

  private resolveConfiguredModel(
    providerId: 'anthropic' | 'openai',
    defaultModel: string,
  ) {
    const primaryProvider = this.configService?.get('LLM_PRIMARY_PROVIDER', {
      infer: true,
    })
    const fallbackProvider = this.configService?.get('LLM_FALLBACK_PROVIDER', {
      infer: true,
    })
    const configuredModel =
      primaryProvider === providerId
        ? this.configService?.get('LLM_PRIMARY_MODEL', { infer: true })
        : fallbackProvider === providerId
          ? this.configService?.get('LLM_FALLBACK_MODEL', { infer: true })
          : undefined

    return configuredModel && !configuredModel.startsWith('mock-')
      ? configuredModel
      : defaultModel
  }
}
