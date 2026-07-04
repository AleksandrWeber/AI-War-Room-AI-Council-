import { Module } from '@nestjs/common'
import { ModelRouterModule } from '../model-router/model-router.module.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { LlmGatewayService } from './llm-gateway.service.js'
import { LlmProviderRegistry } from './llm-provider.registry.js'
import { MockLlmProvider } from './mock-llm.provider.js'

@Module({
  imports: [ObservabilityModule, ModelRouterModule],
  providers: [LlmGatewayService, LlmProviderRegistry, MockLlmProvider],
  exports: [LlmGatewayService],
})
export class LlmModule {}
