import { describe, expect, it } from 'vitest'
import type { ResearchRolloutInput } from './research-rollout.helpers.js'
import { evaluateResearchRollout } from './research-rollout.helpers.js'

function createInput(overrides: Partial<ResearchRolloutInput>): ResearchRolloutInput {
  return {
    nodeEnv: 'production',
    researchProvider: 'tavily',
    tavilyApiKey: 'tvly-test',
    tavilyMaxResults: 5,
    ...overrides,
  }
}

describe('evaluateResearchRollout', () => {
  it('passes production tavily rollout checks', () => {
    const rollout = evaluateResearchRollout(createInput({}))

    expect(rollout.status).toBe('ready')
  })

  it('fails production rollout when mock research provider is configured', () => {
    const rollout = evaluateResearchRollout(
      createInput({
        researchProvider: 'mock',
        tavilyApiKey: undefined,
      }),
    )

    expect(rollout.status).toBe('not_ready')
    expect(rollout.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'research_provider',
          status: 'fail',
        }),
      ]),
    )
  })

  it('fails production rollout when tavily api key is missing', () => {
    const rollout = evaluateResearchRollout(
      createInput({
        tavilyApiKey: undefined,
      }),
    )

    expect(rollout.status).toBe('not_ready')
    expect(rollout.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'tavily_api_key',
          status: 'fail',
        }),
      ]),
    )
  })
})
