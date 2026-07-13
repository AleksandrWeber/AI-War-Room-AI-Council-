import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import { ProviderCredentialsService } from '../provider-credentials/provider-credentials.service.js'
import type {
  ResearchDocument,
  ResearchProvider,
  ResearchProviderRequest,
} from './research.types.js'

type SerperSearchResponse = {
  organic?: Array<{
    title?: string
    link?: string
    snippet?: string
    date?: string
  }>
}

@Injectable()
export class SerperResearchProvider implements ResearchProvider {
  readonly providerId = 'serper'

  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly providerCredentialsService: ProviderCredentialsService,
  ) {}

  async search(request: ResearchProviderRequest): Promise<ResearchDocument[]> {
    const apiKey =
      (await this.providerCredentialsService.resolveApiKey({
        workspaceId: request.draftRun.workspaceId,
        providerId: 'serper',
      })) ?? this.configService.get('SERPER_API_KEY', { infer: true })

    if (!apiKey) {
      throw new Error(
        'Serper research requires a workspace BYOK key or SERPER_API_KEY.',
      )
    }

    const response = await fetch(
      this.configService.get('SERPER_API_URL', { infer: true }),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          q: this.createQuery(request),
          num: this.configService.get('SERPER_MAX_RESULTS', { infer: true }),
        }),
        signal: AbortSignal.timeout(
          this.configService.get('LLM_REQUEST_TIMEOUT_MS', { infer: true }),
        ),
      },
    )

    if (!response.ok) {
      throw new Error(
        `Serper research provider failed with ${response.status}: ${await response.text()}`,
      )
    }

    const body = (await response.json()) as SerperSearchResponse
    const now = new Date().toISOString()

    return (body.organic ?? [])
      .filter((result) => result.title && result.link && result.snippet)
      .map((result, index) => ({
        sourceId: `serper_${index + 1}`,
        title: result.title!,
        url: result.link!,
        provider: this.providerId,
        publishedAt: result.date ? new Date(result.date).toISOString() : now,
        content: result.snippet!,
      }))
  }

  private createQuery(request: ResearchProviderRequest) {
    const idea = request.draftRun.idea

    return [
      idea.rawIdea,
      idea.targetAudience ? `target users ${idea.targetAudience}` : null,
      'market research competitors pricing demand',
    ]
      .filter(Boolean)
      .join(' ')
  }
}
