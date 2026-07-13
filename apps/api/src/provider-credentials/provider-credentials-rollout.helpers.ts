import {
  DEFAULT_APP_ENCRYPTION_KEY,
  type ManagedLlmProviderId,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

export type ProviderCredentialsRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ProviderCredentialsRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ProviderCredentialsRolloutCheck[]
  guidance: string
}

export type ProviderCredentialsRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  appEncryptionKey: string
  encryptionRoundtripPassed: boolean
  usesInMemoryRepository: boolean
  llmPrimaryProvider: ApiEnv['LLM_PRIMARY_PROVIDER']
  llmFallbackProvider: ApiEnv['LLM_FALLBACK_PROVIDER']
  anthropicApiKey?: string
  openaiApiKey?: string
  geminiApiKey?: string
}

const managedProviders: ManagedLlmProviderId[] = [
  'anthropic',
  'openai',
  'gemini',
]

function activeRealProviders(input: ProviderCredentialsRolloutInput) {
  return new Set(
    [input.llmPrimaryProvider, input.llmFallbackProvider].filter(
      (provider): provider is ManagedLlmProviderId =>
        provider === 'anthropic' ||
        provider === 'openai' ||
        provider === 'gemini',
    ),
  )
}

export function evaluateProviderCredentialsRollout(
  input: ProviderCredentialsRolloutInput,
): ProviderCredentialsRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const activeProviders = activeRealProviders(input)

  const checks: ProviderCredentialsRolloutCheck[] = [
    {
      name: 'encryption_key_configured',
      label: 'Encryption key configured',
      status: input.appEncryptionKey.length >= 16 ? 'pass' : 'fail',
      detail:
        input.appEncryptionKey.length >= 16
          ? 'APP_ENCRYPTION_KEY meets minimum length requirements.'
          : 'APP_ENCRYPTION_KEY must be at least 16 characters.',
    },
    {
      name: 'production_encryption_key',
      label: 'Production encryption key',
      status:
        !isProduction || input.appEncryptionKey !== DEFAULT_APP_ENCRYPTION_KEY
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Default encryption key is allowed outside production.'
          : input.appEncryptionKey !== DEFAULT_APP_ENCRYPTION_KEY
            ? 'Production encryption key is not the default development value.'
            : 'Production provider credentials rollout requires a non-default APP_ENCRYPTION_KEY.',
    },
    {
      name: 'encryption_roundtrip',
      label: 'Encryption roundtrip',
      status: input.encryptionRoundtripPassed ? 'pass' : 'fail',
      detail: input.encryptionRoundtripPassed
        ? 'Provider credential encryption roundtrip succeeded.'
        : 'Provider credential encryption roundtrip failed.',
    },
    {
      name: 'managed_providers_supported',
      label: 'Managed providers supported',
      status: managedProviders.length >= 2 ? 'pass' : 'fail',
      detail: `Managed providers: ${managedProviders.join(', ')}.`,
    },
    {
      name: 'postgres_persistence',
      label: 'PostgreSQL persistence',
      status: !isProduction || !input.usesInMemoryRepository ? 'pass' : 'fail',
      detail:
        !isProduction || !input.usesInMemoryRepository
          ? 'Provider credentials use durable persistence outside tests.'
          : 'Production provider credentials rollout cannot rely on in-memory persistence.',
    },
    {
      name: 'anthropic_system_key',
      label: 'Anthropic system key',
      status:
        !activeProviders.has('anthropic') || Boolean(input.anthropicApiKey)
          ? 'pass'
          : 'fail',
      detail: !activeProviders.has('anthropic')
        ? 'Anthropic is not configured as an active LLM provider.'
        : input.anthropicApiKey
          ? 'Anthropic system API key is configured for fallback routing.'
          : 'ANTHROPIC_API_KEY is required for platform readiness when Anthropic is an active provider. Workspace BYOK overrides are separate and are not checked here.',
    },
    {
      name: 'openai_system_key',
      label: 'OpenAI system key',
      status:
        !activeProviders.has('openai') || Boolean(input.openaiApiKey) ? 'pass' : 'fail',
      detail: !activeProviders.has('openai')
        ? 'OpenAI is not configured as an active LLM provider.'
        : input.openaiApiKey
          ? 'OpenAI system API key is configured for fallback routing.'
          : 'OPENAI_API_KEY is required for platform readiness when OpenAI is an active provider. Workspace BYOK overrides are separate and are not checked here.',
    },
    {
      name: 'gemini_system_key',
      label: 'Gemini system key',
      status:
        !activeProviders.has('gemini') || Boolean(input.geminiApiKey)
          ? 'pass'
          : 'fail',
      detail: !activeProviders.has('gemini')
        ? 'Gemini is not configured as an active LLM provider.'
        : input.geminiApiKey
          ? 'Gemini system API key is configured for fallback routing.'
          : 'GEMINI_API_KEY is required for platform readiness when Gemini is an active provider. Workspace BYOK overrides are separate and are not checked here.',
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
        ? 'Provider credentials rollout checks passed. Encryption and managed provider support are ready for production BYOK.'
        : 'Provider credentials rollout is not ready. Resolve failed checks before enabling workspace provider keys in production.',
  }
}
