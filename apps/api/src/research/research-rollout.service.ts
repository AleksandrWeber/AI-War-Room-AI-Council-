import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getResearchProviderGuidance,
  researchCapabilitiesResponseSchema,
  researchRolloutResponseSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { evaluateResearchRollout } from './research-rollout.helpers.js'

@Injectable()
export class ResearchRolloutService {
  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  getCapabilities() {
    const researchProvider = this.configService.get('RESEARCH_PROVIDER', {
      infer: true,
    })

    return researchCapabilitiesResponseSchema.parse({
      researchProvider,
      tavilyMaxResults: this.configService.get('TAVILY_MAX_RESULTS', {
        infer: true,
      }),
      supportsResearchRollout: true,
      guidance: getResearchProviderGuidance({ researchProvider }),
    })
  }

  getResearchRollout() {
    const rollout = evaluateResearchRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      researchProvider: this.configService.get('RESEARCH_PROVIDER', {
        infer: true,
      }),
      tavilyApiKey: this.configService.get('TAVILY_API_KEY', { infer: true }),
      tavilyMaxResults: this.configService.get('TAVILY_MAX_RESULTS', {
        infer: true,
      }),
    })

    return researchRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }
}
