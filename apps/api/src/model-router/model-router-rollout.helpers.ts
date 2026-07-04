import type { ApiEnv } from '../config/env.js'
import type { ModelRegistryEntry } from '@ai-war-room/schemas'

export type ModelRouterRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ModelRouterRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ModelRouterRolloutCheck[]
  guidance: string
}

export type ModelRouterRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  llmPrimaryProvider: ApiEnv['LLM_PRIMARY_PROVIDER']
  llmFallbackProvider: ApiEnv['LLM_FALLBACK_PROVIDER']
  models: ModelRegistryEntry[]
}

const criticalRoles = ['triage', 'moderator', 'prd'] as const

function healthyActiveModels(models: ModelRegistryEntry[]) {
  return models.filter(
    (model) =>
      model.lifecycleStatus === 'active' && model.healthStatus === 'healthy',
  )
}

function healthyActiveForProvider(
  provider: ApiEnv['LLM_PRIMARY_PROVIDER'],
  models: ModelRegistryEntry[],
) {
  return healthyActiveModels(models).filter(
    (model) => model.providerId === provider,
  )
}

function healthyActiveForRole(role: string, models: ModelRegistryEntry[]) {
  return healthyActiveModels(models).filter((model) =>
    model.supportedRoles.includes(role as ModelRegistryEntry['supportedRoles'][number]),
  )
}

export function evaluateModelRouterRollout(
  input: ModelRouterRolloutInput,
): ModelRouterRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const activeProviders = new Set([
    input.llmPrimaryProvider,
    input.llmFallbackProvider,
  ])
  const healthyActive = healthyActiveModels(input.models)
  const degradedActiveCount = input.models.filter(
    (model) =>
      model.lifecycleStatus === 'active' && model.healthStatus === 'degraded',
  ).length

  const checks: ModelRouterRolloutCheck[] = [
    {
      name: 'registry_populated',
      label: 'Model registry populated',
      status: input.models.length > 0 ? 'pass' : 'fail',
      detail:
        input.models.length > 0
          ? `Registry contains ${input.models.length} models.`
          : 'Model registry is empty.',
    },
    {
      name: 'primary_provider_models',
      label: 'Primary provider champions',
      status:
        healthyActiveForProvider(input.llmPrimaryProvider, input.models).length >
        0
          ? 'pass'
          : 'fail',
      detail:
        healthyActiveForProvider(input.llmPrimaryProvider, input.models).length >
        0
          ? `Healthy active models exist for ${input.llmPrimaryProvider}.`
          : `No healthy active models are available for ${input.llmPrimaryProvider}.`,
    },
    {
      name: 'fallback_provider_models',
      label: 'Fallback provider champions',
      status:
        input.llmFallbackProvider === input.llmPrimaryProvider ||
        healthyActiveForProvider(input.llmFallbackProvider, input.models).length >
          0
          ? 'pass'
          : 'fail',
      detail:
        input.llmFallbackProvider === input.llmPrimaryProvider
          ? 'Fallback provider matches primary provider.'
          : healthyActiveForProvider(input.llmFallbackProvider, input.models)
                .length > 0
            ? `Healthy active models exist for ${input.llmFallbackProvider}.`
            : `No healthy active models are available for ${input.llmFallbackProvider}.`,
    },
    {
      name: 'production_mock_champions',
      label: 'Production mock champions',
      status:
        !isProduction ||
        !activeProviders.has('mock') ||
        input.llmPrimaryProvider !== 'mock'
          ? 'pass'
          : 'fail',
      detail:
        !isProduction || input.llmPrimaryProvider !== 'mock'
          ? 'Mock champions are allowed outside production.'
          : 'Production model router rollout cannot rely on mock champions.',
    },
    ...criticalRoles.map((role) => ({
      name: `${role}_route_ready`,
      label: `${role} route ready`,
      status: (healthyActiveForRole(role, input.models).length > 0
        ? 'pass'
        : 'fail') as ModelRouterRolloutCheck['status'],
      detail:
        healthyActiveForRole(role, input.models).length > 0
          ? `At least one healthy active model supports ${role}.`
          : `No healthy active model supports ${role}.`,
    })),
    {
      name: 'degraded_active_models',
      label: 'Degraded active models',
      status: (!isProduction || degradedActiveCount === 0
        ? 'pass'
        : 'fail') as ModelRouterRolloutCheck['status'],
      detail:
        degradedActiveCount === 0
          ? 'No active models are degraded.'
          : `${degradedActiveCount} active model(s) are degraded.`,
    },
    {
      name: 'champion_deputy_coverage',
      label: 'Champion/deputy coverage',
      status: (healthyActive.length >= 2 || healthyActive.length === 1
        ? 'pass'
        : 'fail') as ModelRouterRolloutCheck['status'],
      detail:
        healthyActive.length >= 2
          ? `${healthyActive.length} healthy active models are available for failover.`
          : healthyActive.length === 1
            ? 'One healthy active model is available.'
            : 'No healthy active models are available for routing.',
    },
  ]

  const status = checks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    checks,
    guidance:
      status === 'ready'
        ? 'Model router rollout checks passed. Registry champions and critical routes are ready for production.'
        : 'Model router rollout is not ready. Resolve failed checks before relying on production model routing.',
  }
}
