import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { LlmService } from './llm.service.js'

function createLlmService(env: Partial<ApiEnv> = {}) {
  const config = {
    NODE_ENV: 'development',
    LLM_PRIMARY_PROVIDER: 'mock',
    LLM_FALLBACK_PROVIDER: 'mock',
    LLM_PRIMARY_MODEL: 'mock-json-v1',
    LLM_FALLBACK_MODEL: 'mock-json-v1',
    RESEARCH_PROVIDER: 'mock',
    ...env,
  } as ApiEnv

  return new LlmService({
    get: (key: keyof ApiEnv) => config[key],
  } as ConfigService<ApiEnv, true>)
}

describe('LlmService', () => {
  it('reports llm capabilities', () => {
    const service = createLlmService()

    expect(service.getCapabilities()).toMatchObject({
      primaryProvider: 'mock',
      supportsLlmRollout: true,
    })
  })

  it('reports llm rollout readiness for development mock providers', () => {
    const service = createLlmService()

    expect(service.getLlmRollout()).toMatchObject({
      status: 'ready',
      primaryProvider: 'mock',
    })
  })
})
