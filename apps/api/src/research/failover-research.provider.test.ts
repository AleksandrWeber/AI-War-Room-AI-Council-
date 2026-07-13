import { describe, expect, it, vi } from 'vitest'
import { FailoverResearchProvider } from './failover-research.provider.js'
import type { ResearchProvider } from './research.types.js'

function createDraftRequest() {
  return {
    draftRun: {
      runId: 'run_1',
      workspaceId: 'workspace_1',
      idea: {
        rawIdea: 'AI planning workspace',
        strategicGoals: [],
        technicalPreferences: [],
        constraints: [],
        references: [],
      },
    },
  } as never
}

describe('FailoverResearchProvider', () => {
  it('returns documents from the first successful provider', async () => {
    const primary: ResearchProvider = {
      providerId: 'tavily',
      search: vi.fn(async () => {
        throw new Error('primary down')
      }),
    }
    const secondary: ResearchProvider = {
      providerId: 'serper',
      search: vi.fn(async () => [
        {
          sourceId: 'serper_1',
          title: 'Market note',
          url: 'https://example.com',
          provider: 'serper',
          publishedAt: '2026-07-13T00:00:00.000Z',
          content: 'Demand looks healthy.',
        },
      ]),
    }
    const observabilityService = { record: vi.fn() }
    const failover = new FailoverResearchProvider(
      [primary, secondary],
      observabilityService as never,
    )

    await expect(failover.search(createDraftRequest())).resolves.toMatchObject([
      { provider: 'serper', title: 'Market note' },
    ])
    expect(observabilityService.record).toHaveBeenCalledWith(
      'research_provider_failed',
      expect.objectContaining({ providerId: 'tavily' }),
    )
    expect(observabilityService.record).toHaveBeenCalledWith(
      'research_provider_succeeded',
      expect.objectContaining({ providerId: 'serper' }),
    )
  })

  it('rethrows when every provider fails so Market Research can fail-soft', async () => {
    const primary: ResearchProvider = {
      providerId: 'tavily',
      search: vi.fn(async () => {
        throw new Error('primary down')
      }),
    }
    const secondary: ResearchProvider = {
      providerId: 'serper',
      search: vi.fn(async () => {
        throw new Error('secondary down')
      }),
    }
    const failover = new FailoverResearchProvider(
      [primary, secondary],
      { record: vi.fn() } as never,
    )

    await expect(failover.search(createDraftRequest())).rejects.toThrow(
      /All research providers failed/,
    )
  })
})
