import { Injectable } from '@nestjs/common'
import { ObservabilityService } from '../observability/observability.service.js'
import type {
  ResearchDocument,
  ResearchProvider,
  ResearchProviderRequest,
} from './research.types.js'

@Injectable()
export class FailoverResearchProvider implements ResearchProvider {
  readonly providerId = 'failover'

  constructor(
    private readonly providers: ResearchProvider[],
    private readonly observabilityService: ObservabilityService,
  ) {}

  async search(request: ResearchProviderRequest): Promise<ResearchDocument[]> {
    const errors: string[] = []

    for (const provider of this.providers) {
      try {
        const documents = await provider.search(request)
        this.observabilityService.record('research_provider_succeeded', {
          workspaceId: request.draftRun.workspaceId,
          runId: request.draftRun.runId,
          providerId: provider.providerId,
          documentCount: documents.length,
          attemptedProviders: this.providers
            .map((item) => item.providerId)
            .join(','),
        })
        return documents
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown research failure.'
        errors.push(`${provider.providerId}: ${message}`)
        this.observabilityService.record('research_provider_failed', {
          workspaceId: request.draftRun.workspaceId,
          runId: request.draftRun.runId,
          providerId: provider.providerId,
          errorMessage: message,
        })
      }
    }

    throw new Error(
      `All research providers failed (${errors.join(' | ')}).`,
    )
  }
}
