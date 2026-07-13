import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { ProviderCredentialsModule } from '../provider-credentials/provider-credentials.module.js'
import { ShieldModule } from '../shield/shield.module.js'
import { UsageModule } from '../usage/usage.module.js'
import { FailoverResearchProvider } from './failover-research.provider.js'
import { MockResearchProvider } from './mock-research.provider.js'
import { ResearchController } from './research.controller.js'
import { ResearchRolloutService } from './research-rollout.service.js'
import { ResearchService } from './research.service.js'
import { RESEARCH_PROVIDER, type ResearchProvider } from './research.types.js'
import { SerperResearchProvider } from './serper-research.provider.js'
import { TavilyResearchProvider } from './tavily-research.provider.js'

@Module({
  imports: [
    UsageModule,
    ObservabilityModule,
    ShieldModule,
    ProviderCredentialsModule,
  ],
  controllers: [ResearchController],
  providers: [
    ResearchService,
    ResearchRolloutService,
    MockResearchProvider,
    TavilyResearchProvider,
    SerperResearchProvider,
    {
      provide: RESEARCH_PROVIDER,
      inject: [
        ConfigService,
        MockResearchProvider,
        TavilyResearchProvider,
        SerperResearchProvider,
        ObservabilityService,
      ],
      useFactory: (
        configService: ConfigService<ApiEnv, true>,
        mockResearchProvider: MockResearchProvider,
        tavilyResearchProvider: TavilyResearchProvider,
        serperResearchProvider: SerperResearchProvider,
        observabilityService: ObservabilityService,
      ): ResearchProvider => {
        if (configService.get('RESEARCH_PROVIDER', { infer: true }) !== 'tavily') {
          return mockResearchProvider
        }

        const secondary = configService.get('RESEARCH_SECONDARY_PROVIDER', {
          infer: true,
        })
        if (secondary === 'serper') {
          return new FailoverResearchProvider(
            [tavilyResearchProvider, serperResearchProvider],
            observabilityService,
          )
        }

        return tavilyResearchProvider
      },
    },
  ],
  exports: [ResearchService, ResearchRolloutService],
})
export class ResearchModule {}
