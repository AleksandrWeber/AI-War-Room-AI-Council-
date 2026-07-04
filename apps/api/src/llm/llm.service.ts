import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLlmProviderGuidance,
  llmCapabilitiesResponseSchema,
  llmRolloutResponseSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { evaluateLlmRollout } from './llm-rollout.helpers.js'

@Injectable()
export class LlmService {
  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  getCapabilities() {
    const primaryProvider = this.configService.get('LLM_PRIMARY_PROVIDER', {
      infer: true,
    })
    const fallbackProvider = this.configService.get('LLM_FALLBACK_PROVIDER', {
      infer: true,
    })

    return llmCapabilitiesResponseSchema.parse({
      primaryProvider,
      fallbackProvider,
      primaryModel: this.configService.get('LLM_PRIMARY_MODEL', { infer: true }),
      fallbackModel: this.configService.get('LLM_FALLBACK_MODEL', {
        infer: true,
      }),
      researchProvider: this.configService.get('RESEARCH_PROVIDER', {
        infer: true,
      }),
      supportsLlmRollout: true,
      guidance: getLlmProviderGuidance({
        primaryProvider,
        fallbackProvider,
      }),
    })
  }

  getLlmRollout() {
    const rollout = evaluateLlmRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      llmPrimaryProvider: this.configService.get('LLM_PRIMARY_PROVIDER', {
        infer: true,
      }),
      llmFallbackProvider: this.configService.get('LLM_FALLBACK_PROVIDER', {
        infer: true,
      }),
      llmPrimaryModel: this.configService.get('LLM_PRIMARY_MODEL', {
        infer: true,
      }),
      llmFallbackModel: this.configService.get('LLM_FALLBACK_MODEL', {
        infer: true,
      }),
      anthropicApiKey: this.configService.get('ANTHROPIC_API_KEY', {
        infer: true,
      }),
      openaiApiKey: this.configService.get('OPENAI_API_KEY', { infer: true }),
      researchProvider: this.configService.get('RESEARCH_PROVIDER', {
        infer: true,
      }),
      tavilyApiKey: this.configService.get('TAVILY_API_KEY', { infer: true }),
    })

    return llmRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }
}
