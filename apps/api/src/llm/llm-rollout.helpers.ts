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
  geminiApiKey?: string
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

  if (provider === 'gemini') {
    return Boolean(input.geminiApiKey)
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
          : 'ANTHROPIC_API_KEY is required for platform readiness when Anthropic is an active provider. Workspace BYOK overrides are separate and are not checked here.',
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
          : 'OPENAI_API_KEY is required for platform readiness when OpenAI is an active provider. Workspace BYOK overrides are separate and are not checked here.',
    },
    {
      name: 'gemini_api_key',
      label: 'Gemini API key',
      status:
        !activeProviders.has('gemini') || hasProviderCredential('gemini', input)
          ? 'pass'
          : 'fail',
      detail: !activeProviders.has('gemini')
        ? 'Gemini is not configured as a primary or fallback provider.'
        : input.geminiApiKey
          ? 'Gemini API key is configured.'
          : 'GEMINI_API_KEY is required for platform readiness when Gemini is an active provider. Workspace BYOK overrides are separate and are not checked here.',
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
