import { Module } from '@nestjs/common'
import { ModelRouterModule } from '../model-router/model-router.module.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { ProviderCredentialsModule } from '../provider-credentials/provider-credentials.module.js'
import { AnthropicLlmProvider } from './anthropic-llm.provider.js'
import { LlmController } from './llm.controller.js'
import { LlmGatewayService } from './llm-gateway.service.js'
import { LlmProviderRegistry } from './llm-provider.registry.js'
import { LlmService } from './llm.service.js'
import { MockLlmProvider } from './mock-llm.provider.js'
import { OpenAiLlmProvider } from './openai-llm.provider.js'

@Module({
  imports: [ObservabilityModule, ModelRouterModule, ProviderCredentialsModule],
  controllers: [LlmController],
  providers: [
    LlmService,
    LlmGatewayService,
    LlmProviderRegistry,
    MockLlmProvider,
    AnthropicLlmProvider,
    OpenAiLlmProvider,
  ],
  exports: [LlmService, LlmGatewayService],
})
export class LlmModule {}
