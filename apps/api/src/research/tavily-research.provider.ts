import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import type {
  ResearchDocument,
  ResearchProvider,
  ResearchProviderRequest,
} from './research.types.js'

type TavilySearchResponse = {
  results?: Array<{
    title?: string
    url?: string
    content?: string
    published_date?: string
  }>
}

@Injectable()
export class TavilyResearchProvider implements ResearchProvider {
  readonly providerId = 'tavily'

  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  async search(request: ResearchProviderRequest): Promise<ResearchDocument[]> {
    const apiKey = this.configService.get('TAVILY_API_KEY', { infer: true })

    if (!apiKey) {
      throw new Error('TAVILY_API_KEY is required for Tavily research provider.')
    }

    const response = await fetch(
      this.configService.get('TAVILY_API_URL', { infer: true }),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          query: this.createQuery(request),
          search_depth: 'basic',
          include_answer: false,
          include_raw_content: false,
          max_results: this.configService.get('TAVILY_MAX_RESULTS', {
            infer: true,
          }),
        }),
        signal: AbortSignal.timeout(
          this.configService.get('LLM_REQUEST_TIMEOUT_MS', { infer: true }),
        ),
      },
    )

    if (!response.ok) {
      throw new Error(
        `Tavily research provider failed with ${response.status}: ${await response.text()}`,
      )
    }

    const body = (await response.json()) as TavilySearchResponse
    const now = new Date().toISOString()

    return (body.results ?? [])
      .filter((result) => result.title && result.url && result.content)
      .map((result, index) => ({
        sourceId: `tavily_${index + 1}`,
        title: result.title!,
        url: result.url!,
        provider: this.providerId,
        publishedAt: result.published_date
          ? new Date(result.published_date).toISOString()
          : now,
        content: result.content!,
      }))
  }

  private createQuery(request: ResearchProviderRequest) {
    const idea = request.draftRun.idea

    return [
      idea.rawIdea,
      idea.targetAudience ? `target users: ${idea.targetAudience}` : null,
      idea.strategicGoals.length
        ? `goals: ${idea.strategicGoals.join(', ')}`
        : null,
      idea.constraints.length
        ? `constraints: ${idea.constraints.join(', ')}`
        : null,
      'market research competitors pricing demand product validation',
    ]
      .filter(Boolean)
      .join(' ')
  }
}
