import { Module } from '@nestjs/common'
import { ModelRouterModule } from '../model-router/model-router.module.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { ProviderCredentialsModule } from '../provider-credentials/provider-credentials.module.js'
import { AnthropicLlmProvider } from './anthropic-llm.provider.js'
import { LlmGatewayService } from './llm-gateway.service.js'
import { LlmProviderRegistry } from './llm-provider.registry.js'
import { MockLlmProvider } from './mock-llm.provider.js'
import { OpenAiLlmProvider } from './openai-llm.provider.js'

@Module({
  imports: [ObservabilityModule, ModelRouterModule, ProviderCredentialsModule],
  providers: [
    LlmGatewayService,
    LlmProviderRegistry,
    MockLlmProvider,
    AnthropicLlmProvider,
    OpenAiLlmProvider,
  ],
  exports: [LlmGatewayService],
})
export class LlmModule {}
