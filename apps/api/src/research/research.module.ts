import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { ShieldModule } from '../shield/shield.module.js'
import { UsageModule } from '../usage/usage.module.js'
import { MockResearchProvider } from './mock-research.provider.js'
import { ResearchService } from './research.service.js'
import { RESEARCH_PROVIDER, type ResearchProvider } from './research.types.js'
import { TavilyResearchProvider } from './tavily-research.provider.js'

@Module({
  imports: [UsageModule, ObservabilityModule, ShieldModule],
  providers: [
    ResearchService,
    MockResearchProvider,
    TavilyResearchProvider,
    {
      provide: RESEARCH_PROVIDER,
      inject: [ConfigService, MockResearchProvider, TavilyResearchProvider],
      useFactory: (
        configService: ConfigService<ApiEnv, true>,
        mockResearchProvider: MockResearchProvider,
        tavilyResearchProvider: TavilyResearchProvider,
      ): ResearchProvider => {
        return configService.get('RESEARCH_PROVIDER', { infer: true }) === 'tavily'
          ? tavilyResearchProvider
          : mockResearchProvider
      },
    },
  ],
  exports: [ResearchService],
})
export class ResearchModule {}
