import { describe, expect, it } from 'vitest'
import { DEFAULT_APP_ENCRYPTION_KEY } from '@ai-war-room/schemas'
import type { ProviderCredentialsRolloutInput } from './provider-credentials-rollout.helpers.js'
import { evaluateProviderCredentialsRollout } from './provider-credentials-rollout.helpers.js'

function createInput(
  overrides: Partial<ProviderCredentialsRolloutInput>,
): ProviderCredentialsRolloutInput {
  return {
    nodeEnv: 'test',
    appEncryptionKey: DEFAULT_APP_ENCRYPTION_KEY,
    encryptionRoundtripPassed: true,
    usesInMemoryRepository: true,
    llmPrimaryProvider: 'mock',
    llmFallbackProvider: 'mock',
    ...overrides,
  }
}

describe('evaluateProviderCredentialsRollout', () => {
  it('passes in test mode with mock providers', () => {
    const rollout = evaluateProviderCredentialsRollout(createInput({}))

    expect(rollout.status).toBe('ready')
  })

  it('fails when encryption roundtrip fails', () => {
    const rollout = evaluateProviderCredentialsRollout(
      createInput({ encryptionRoundtripPassed: false }),
    )

    expect(rollout.status).toBe('not_ready')
  })

  it('fails in production with default encryption key', () => {
    const rollout = evaluateProviderCredentialsRollout(
      createInput({
        nodeEnv: 'production',
        usesInMemoryRepository: false,
        llmPrimaryProvider: 'anthropic',
        anthropicApiKey: 'sk-test-key',
      }),
    )

    expect(
      rollout.checks.find((check) => check.name === 'production_encryption_key')
        ?.status,
    ).toBe('fail')
  })
})
