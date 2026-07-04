import { Module } from '@nestjs/common'
import { LlmGatewayService } from './llm-gateway.service.js'
import { LlmProviderRegistry } from './llm-provider.registry.js'
import { MockLlmProvider } from './mock-llm.provider.js'

@Module({
  providers: [LlmGatewayService, LlmProviderRegistry, MockLlmProvider],
  exports: [LlmGatewayService],
})
export class LlmModule {}
