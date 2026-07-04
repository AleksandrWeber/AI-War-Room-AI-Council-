import { Module } from '@nestjs/common'
import { ObservabilityModule } from '../observability/observability.module.js'
import { ShieldModule } from '../shield/shield.module.js'
import { UsageModule } from '../usage/usage.module.js'
import { MockResearchProvider } from './mock-research.provider.js'
import { ResearchService } from './research.service.js'

@Module({
  imports: [UsageModule, ObservabilityModule, ShieldModule],
  providers: [ResearchService, MockResearchProvider],
  exports: [ResearchService],
})
export class ResearchModule {}
