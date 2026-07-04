import { describe, expect, it } from 'vitest'
import type { LlmRolloutInput } from './llm-rollout.helpers.js'
import { evaluateLlmRollout } from './llm-rollout.helpers.js'

function createInput(overrides: Partial<LlmRolloutInput>): LlmRolloutInput {
  return {
    nodeEnv: 'production',
    llmPrimaryProvider: 'anthropic',
    llmFallbackProvider: 'openai',
    llmPrimaryModel: 'claude-3-5-sonnet-latest',
    llmFallbackModel: 'gpt-4o-mini',
    anthropicApiKey: 'sk-ant-test',
    openaiApiKey: 'sk-openai-test',
    ...overrides,
  }
}

describe('evaluateLlmRollout', () => {
  it('passes production anthropic/openai rollout checks', () => {
    const rollout = evaluateLlmRollout(createInput({}))

    expect(rollout.status).toBe('ready')
  })

  it('fails production rollout when mock primary provider is configured', () => {
    const rollout = evaluateLlmRollout(
      createInput({
        llmPrimaryProvider: 'mock',
        llmFallbackProvider: 'mock',
        llmPrimaryModel: 'mock-json-v1',
        llmFallbackModel: 'mock-json-v1',
      }),
    )

    expect(rollout.status).toBe('not_ready')
    expect(rollout.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'primary_provider',
          status: 'fail',
        }),
      ]),
    )
  })
})
