import type { ApiEnv } from '../config/env.js'
import type { LlmGatewayProviderId } from '@ai-war-room/schemas'

export type LlmRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type LlmRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  primaryProvider: LlmGatewayProviderId
  fallbackProvider: LlmGatewayProviderId
  checks: LlmRolloutCheck[]
  guidance: string
}

export type LlmRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  llmPrimaryProvider: ApiEnv['LLM_PRIMARY_PROVIDER']
  llmFallbackProvider: ApiEnv['LLM_FALLBACK_PROVIDER']
  llmPrimaryModel: string
  llmFallbackModel: string
  anthropicApiKey?: string
  openaiApiKey?: string
}

function hasProviderCredential(
  provider: LlmGatewayProviderId,
  input: LlmRolloutInput,
) {
  if (provider === 'anthropic') {
    return Boolean(input.anthropicApiKey)
  }

  if (provider === 'openai') {
    return Boolean(input.openaiApiKey)
  }

  return true
}

export function evaluateLlmRollout(input: LlmRolloutInput): LlmRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const activeProviders = new Set<LlmGatewayProviderId>([
    input.llmPrimaryProvider,
    input.llmFallbackProvider,
  ])

  const checks: LlmRolloutCheck[] = [
    {
      name: 'primary_provider',
      label: 'Primary LLM provider',
      status:
        !isProduction || input.llmPrimaryProvider !== 'mock' ? 'pass' : 'fail',
      detail:
        !isProduction || input.llmPrimaryProvider !== 'mock'
          ? `Primary provider is ${input.llmPrimaryProvider}.`
          : 'LLM_PRIMARY_PROVIDER=mock cannot be used in production.',
    },
    {
      name: 'primary_model',
      label: 'Primary model',
      status:
        !isProduction ||
        input.llmPrimaryProvider === 'mock' ||
        input.llmPrimaryModel !== 'mock-json-v1'
          ? 'pass'
          : 'fail',
      detail:
        !isProduction ||
        input.llmPrimaryProvider === 'mock' ||
        input.llmPrimaryModel !== 'mock-json-v1'
          ? `Primary model is ${input.llmPrimaryModel}.`
          : 'Production LLM rollout requires a real primary model name.',
    },
    {
      name: 'fallback_provider',
      label: 'Fallback LLM provider',
      status: 'pass',
      detail: `Fallback provider is ${input.llmFallbackProvider}.`,
    },
    {
      name: 'anthropic_api_key',
      label: 'Anthropic API key',
      status:
        !activeProviders.has('anthropic') ||
        hasProviderCredential('anthropic', input)
          ? 'pass'
          : 'fail',
      detail: !activeProviders.has('anthropic')
        ? 'Anthropic is not configured as a primary or fallback provider.'
        : input.anthropicApiKey
          ? 'Anthropic API key is configured.'
          : 'ANTHROPIC_API_KEY is required when Anthropic is active, unless workspace BYOK credentials are provisioned separately.',
    },
    {
      name: 'openai_api_key',
      label: 'OpenAI API key',
      status:
        !activeProviders.has('openai') || hasProviderCredential('openai', input)
          ? 'pass'
          : 'fail',
      detail: !activeProviders.has('openai')
        ? 'OpenAI is not configured as a primary or fallback provider.'
        : input.openaiApiKey
          ? 'OpenAI API key is configured.'
          : 'OPENAI_API_KEY is required when OpenAI is active, unless workspace BYOK credentials are provisioned separately.',
    },
  ]

  const status = checks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    primaryProvider: input.llmPrimaryProvider,
    fallbackProvider: input.llmFallbackProvider,
    checks,
    guidance:
      status === 'ready'
        ? 'LLM rollout checks passed. Primary/fallback providers are ready for production.'
        : 'LLM rollout is not ready. Resolve failed checks before enabling real AI execution in production.',
  }
}
