import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import type { ModelRouterRolloutInput } from './model-router-rollout.helpers.js'
import { evaluateModelRouterRollout } from './model-router-rollout.helpers.js'
import { createDefaultModelRegistry } from './model-router.defaults.js'

function createInput(overrides: Partial<ModelRouterRolloutInput>): ModelRouterRolloutInput {
  const configService = new ConfigService<ApiEnv>({
    LLM_PRIMARY_PROVIDER: 'anthropic',
    LLM_FALLBACK_PROVIDER: 'openai',
    LLM_PRIMARY_MODEL: 'claude-3-5-sonnet-latest',
    LLM_FALLBACK_MODEL: 'gpt-4o-mini',
  })

  return {
    nodeEnv: 'production',
    llmPrimaryProvider: 'anthropic',
    llmFallbackProvider: 'openai',
    models: createDefaultModelRegistry(configService),
    ...overrides,
  }
}

describe('evaluateModelRouterRollout', () => {
  it('passes production rollout when real providers have active champions', () => {
    const rollout = evaluateModelRouterRollout(createInput({}))

    expect(rollout.status).toBe('ready')
  })

  it('passes local mock rollout checks', () => {
    const rollout = evaluateModelRouterRollout(
      createInput({
        nodeEnv: 'development',
        llmPrimaryProvider: 'mock',
        llmFallbackProvider: 'mock',
      }),
    )

    expect(rollout.status).toBe('ready')
  })

  it('fails production rollout when primary provider has no healthy active models', () => {
    const models = createDefaultModelRegistry().map((model) =>
      model.providerId === 'anthropic'
        ? { ...model, lifecycleStatus: 'candidate' as const }
        : model,
    )

    const rollout = evaluateModelRouterRollout(
      createInput({
        models,
      }),
    )

    expect(rollout.status).toBe('not_ready')
    expect(rollout.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'primary_provider_models',
          status: 'fail',
        }),
      ]),
    )
  })
})
