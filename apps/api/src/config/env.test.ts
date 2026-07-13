import { describe, expect, it } from 'vitest'
import { validateEnv } from './env.js'

function baseConfig(overrides: Record<string, unknown> = {}) {
  return {
    NODE_ENV: 'development',
    LLM_PRIMARY_PROVIDER: 'mock',
    LLM_FALLBACK_PROVIDER: 'mock',
    LLM_ALLOW_REAL_PROVIDERS: 'false',
    RESEARCH_PROVIDER: 'mock',
    ...overrides,
  }
}

describe('validateEnv LLM opt-in guardrails', () => {
  it('allows mock providers without opt-in', () => {
    expect(() => validateEnv(baseConfig())).not.toThrow()
  })

  it('rejects real providers in development without LLM_ALLOW_REAL_PROVIDERS', () => {
    expect(() =>
      validateEnv(
        baseConfig({
          LLM_PRIMARY_PROVIDER: 'anthropic',
          LLM_PRIMARY_MODEL: 'claude-3-5-sonnet-latest',
          ANTHROPIC_API_KEY: 'sk-test',
        }),
      ),
    ).toThrow(/LLM_ALLOW_REAL_PROVIDERS=true/)
  })

  it('allows real providers in development when explicitly opted in', () => {
    const env = validateEnv(
      baseConfig({
        LLM_PRIMARY_PROVIDER: 'anthropic',
        LLM_PRIMARY_MODEL: 'claude-3-5-sonnet-latest',
        ANTHROPIC_API_KEY: 'sk-test',
        LLM_ALLOW_REAL_PROVIDERS: 'true',
      }),
    )

    expect(env.LLM_ALLOW_REAL_PROVIDERS).toBe(true)
    expect(env.LLM_PRIMARY_PROVIDER).toBe('anthropic')
  })

  it('allows real providers in production without the local opt-in flag', () => {
    const env = validateEnv(
      baseConfig({
        NODE_ENV: 'production',
        LLM_PRIMARY_PROVIDER: 'openai',
        LLM_PRIMARY_MODEL: 'gpt-4o',
        LLM_FALLBACK_PROVIDER: 'openai',
        LLM_FALLBACK_MODEL: 'gpt-4o-mini',
        OPENAI_API_KEY: 'sk-test',
        RESEARCH_PROVIDER: 'tavily',
        TAVILY_API_KEY: 'tvly-test',
        APP_ENCRYPTION_KEY: 'production-encryption-key-change-me',
        AUTH_PROVIDER: 'bearer',
        AUTH_BEARER_TOKEN: 'token',
      }),
    )

    expect(env.LLM_PRIMARY_PROVIDER).toBe('openai')
  })

  it('rejects anthropic primary without an API key even when opted in', () => {
    expect(() =>
      validateEnv(
        baseConfig({
          LLM_PRIMARY_PROVIDER: 'anthropic',
          LLM_ALLOW_REAL_PROVIDERS: 'true',
        }),
      ),
    ).toThrow(/ANTHROPIC_API_KEY/)
  })
})
