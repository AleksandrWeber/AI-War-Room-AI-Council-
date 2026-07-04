import { ConfigService } from '@nestjs/config'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { TavilyResearchProvider } from './tavily-research.provider.js'
import type { ResearchProviderRequest } from './research.types.js'

const request: ResearchProviderRequest = {
  draftRun: {
    runId: 'run_test',
    workspaceId: 'workspace_1',
    status: 'draft',
    idea: {
      rawIdea: 'AI War Room for founders',
      targetAudience: 'Founders',
      strategicGoals: ['Validate positioning'],
      technicalPreferences: ['TypeScript'],
      constraints: ['MVP first'],
      references: [],
    },
    shieldScan: {
      scanId: 'scan_test',
      status: 'clear',
      maxSeverity: 'none',
      findings: [],
    },
    triage: {
      domain: 'software',
      subdomain: 'SaaS',
      complexity: 'medium',
      marketConfidence: 'low',
      securitySensitivity: 'medium',
      recommendedRunMode: 'standard',
      recommendedAgents: ['product_manager', 'critic', 'moderator'],
      estimatedDurationSeconds: 60,
      estimatedMaxCostUsd: 0.5,
      reasoningSummary: 'test',
    },
    selectedAgents: ['product_manager', 'critic', 'moderator'],
    estimatedDurationSeconds: 60,
    estimatedMaxCostUsd: 0.5,
    createdAt: '2026-07-04T00:00:00.000Z',
    updatedAt: '2026-07-04T00:00:00.000Z',
  },
}

function createConfig(overrides: Partial<ApiEnv>) {
  return new ConfigService<ApiEnv>({
    TAVILY_API_URL: 'https://tavily.test/search',
    TAVILY_MAX_RESULTS: 3,
    LLM_REQUEST_TIMEOUT_MS: 30_000,
    ...overrides,
  })
}

describe('TavilyResearchProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps draft context to Tavily search and parses citation documents', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            title: 'Founder PRD automation market',
            url: 'https://example.com/research',
            content: 'Founders compare AI planning tools by trust and output quality.',
            published_date: '2026-07-01',
          },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const provider = new TavilyResearchProvider(
      createConfig({ TAVILY_API_KEY: 'test-key' }) as never,
    )
    const documents = await provider.search(request)
    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(String(init.body)) as {
      api_key: string
      query: string
      max_results: number
    }

    expect(body.api_key).toBe('test-key')
    expect(body.query).toContain('AI War Room for founders')
    expect(body.query).toContain('target users: Founders')
    expect(body.max_results).toBe(3)
    expect(documents).toEqual([
      {
        sourceId: 'tavily_1',
        title: 'Founder PRD automation market',
        url: 'https://example.com/research',
        provider: 'tavily',
        publishedAt: '2026-07-01T00:00:00.000Z',
        content: 'Founders compare AI planning tools by trust and output quality.',
      },
    ])
  })

  it('fails fast without a Tavily API key', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const provider = new TavilyResearchProvider(createConfig({}) as never)

    await expect(provider.search(request)).rejects.toThrow(
      'TAVILY_API_KEY is required',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
