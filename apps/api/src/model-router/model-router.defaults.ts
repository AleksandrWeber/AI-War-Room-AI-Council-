import { ConfigService } from '@nestjs/config'
import type { ModelRegistryEntry, ModelRouterRole } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

export const allModelRouterRoles: ModelRouterRole[] = [
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

export function createDefaultModelRegistry(
  configService?: ConfigService<ApiEnv, true>,
): ModelRegistryEntry[] {
  const now = new Date().toISOString()
  const mockStatus = resolveConfiguredProviderStatus('mock', configService)
  const anthropicStatus = resolveConfiguredProviderStatus(
    'anthropic',
    configService,
  )
  const openAiStatus = resolveConfiguredProviderStatus('openai', configService)
  const geminiStatus = resolveConfiguredProviderStatus('gemini', configService)
  const cursorStatus = resolveConfiguredProviderStatus('cursor', configService)
  const openRouterStatus = resolveConfiguredProviderStatus(
    'openrouter',
    configService,
  )

  return [
    {
      modelId: 'mock-json-v1-primary',
      providerId: 'mock',
      modelName: 'mock-json-v1',
      supportedRoles: allModelRouterRoles,
      contextWindowTokens: 128_000,
      maxOutputTokens: 8_192,
      inputCostPerMillionTokensUsd: 0,
      outputCostPerMillionTokensUsd: 0,
      latencyP95Ms: 500,
      evaluationScore: 0.88,
      safetyScore: 0.85,
      reliabilityScore: 0.98,
      lifecycleStatus: mockStatus,
      healthStatus: 'healthy',
      consecutiveFailures: 0,
      updatedAt: now,
    },
    {
      modelId: 'mock-json-v1-deputy',
      providerId: 'mock',
      modelName: 'mock-json-v1-deputy',
      supportedRoles: allModelRouterRoles,
      contextWindowTokens: 128_000,
      maxOutputTokens: 8_192,
      inputCostPerMillionTokensUsd: 0,
      outputCostPerMillionTokensUsd: 0,
      latencyP95Ms: 650,
      evaluationScore: 0.82,
      safetyScore: 0.82,
      reliabilityScore: 0.96,
      lifecycleStatus: mockStatus,
      healthStatus: 'healthy',
      consecutiveFailures: 0,
      updatedAt: now,
    },
    {
      modelId: 'mock-json-v2-candidate',
      providerId: 'mock',
      modelName: 'mock-json-v2-candidate',
      supportedRoles: allModelRouterRoles,
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
      modelName: resolveConfiguredModel(
        'anthropic',
        'claude-3-5-sonnet-latest',
        configService,
      ),
      supportedRoles: allModelRouterRoles,
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
      modelName: resolveConfiguredModel('openai', 'gpt-4o-mini', configService),
      supportedRoles: allModelRouterRoles,
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
    {
      modelId: 'gemini-flash-candidate',
      providerId: 'gemini',
      modelName: resolveConfiguredModel(
        'gemini',
        'gemini-2.0-flash',
        configService,
      ),
      supportedRoles: allModelRouterRoles,
      contextWindowTokens: 1_048_576,
      maxOutputTokens: 8_192,
      inputCostPerMillionTokensUsd: 0.1,
      outputCostPerMillionTokensUsd: 0.4,
      latencyP95Ms: 900,
      evaluationScore: 0.87,
      safetyScore: 0.86,
      reliabilityScore: 0.91,
      lifecycleStatus: geminiStatus,
      healthStatus: 'healthy',
      consecutiveFailures: 0,
      updatedAt: now,
    },
    {
      modelId: 'cursor-composer-candidate',
      providerId: 'cursor',
      modelName: resolveConfiguredModel(
        'cursor',
        'composer-2.5',
        configService,
      ),
      supportedRoles: allModelRouterRoles,
      contextWindowTokens: 200_000,
      maxOutputTokens: 8_192,
      inputCostPerMillionTokensUsd: 3,
      outputCostPerMillionTokensUsd: 15,
      latencyP95Ms: 8_000,
      evaluationScore: 0.9,
      safetyScore: 0.88,
      reliabilityScore: 0.9,
      lifecycleStatus: cursorStatus,
      healthStatus: 'healthy',
      consecutiveFailures: 0,
      updatedAt: now,
    },
    {
      modelId: 'openrouter-fast-candidate',
      providerId: 'openrouter',
      modelName: resolveConfiguredModel(
        'openrouter',
        'openai/gpt-4o-mini',
        configService,
      ),
      supportedRoles: allModelRouterRoles,
      contextWindowTokens: 128_000,
      maxOutputTokens: 16_384,
      inputCostPerMillionTokensUsd: 0.15,
      outputCostPerMillionTokensUsd: 0.6,
      latencyP95Ms: 1_500,
      evaluationScore: 0.88,
      safetyScore: 0.86,
      reliabilityScore: 0.9,
      lifecycleStatus: openRouterStatus,
      healthStatus: 'healthy',
      consecutiveFailures: 0,
      updatedAt: now,
    },
  ]
}

function resolveConfiguredProviderStatus(
  providerId: 'mock' | 'anthropic' | 'openai' | 'gemini' | 'cursor' | 'openrouter',
  configService?: ConfigService<ApiEnv, true>,
): ModelRegistryEntry['lifecycleStatus'] {
  if (!configService) {
    return providerId === 'mock' ? 'active' : 'candidate'
  }

  const primaryProvider = configService.get('LLM_PRIMARY_PROVIDER', {
    infer: true,
  })
  const fallbackProvider = configService.get('LLM_FALLBACK_PROVIDER', {
    infer: true,
  })

  return primaryProvider === providerId || fallbackProvider === providerId
    ? 'active'
    : 'candidate'
}

function resolveConfiguredModel(
  providerId: 'anthropic' | 'openai' | 'gemini' | 'cursor' | 'openrouter',
  defaultModel: string,
  configService?: ConfigService<ApiEnv, true>,
) {
  const primaryProvider = configService?.get('LLM_PRIMARY_PROVIDER', {
    infer: true,
  })
  const fallbackProvider = configService?.get('LLM_FALLBACK_PROVIDER', {
    infer: true,
  })
  const configuredModel =
    primaryProvider === providerId
      ? configService?.get('LLM_PRIMARY_MODEL', { infer: true })
      : fallbackProvider === providerId
        ? configService?.get('LLM_FALLBACK_MODEL', { infer: true })
        : undefined

  return configuredModel && !configuredModel.startsWith('mock-')
    ? configuredModel
    : defaultModel
}
