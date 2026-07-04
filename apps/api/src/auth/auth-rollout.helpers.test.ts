import { describe, expect, it } from 'vitest'
import type { AuthRolloutInput } from './auth-rollout.helpers.js'
import { evaluateAuthRollout } from './auth-rollout.helpers.js'

function createInput(overrides: Partial<AuthRolloutInput>): AuthRolloutInput {
  return {
    nodeEnv: 'production',
    authProvider: 'external',
    authBearerToken: 'prod-bootstrap-token',
    appEncryptionKey: 'production-encryption-key-32chars',
    webOrigin: 'https://app.example.com',
    authExternalAdapter: 'jwks',
    authExternalJwksUrl: 'https://clerk.example.com/.well-known/jwks.json',
    authExternalIssuer: 'https://clerk.example.com',
    authExternalAudience: 'ai-war-room-api',
    ...overrides,
  }
}

describe('evaluateAuthRollout', () => {
  it('passes production external jwks rollout checks', () => {
    const rollout = evaluateAuthRollout(createInput({}))

    expect(rollout.status).toBe('ready')
  })

  it('fails production rollout when header auth is configured', () => {
    const rollout = evaluateAuthRollout(
      createInput({
        authProvider: 'headers',
      }),
    )

    expect(rollout.status).toBe('not_ready')
    expect(rollout.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'production_auth_provider',
          status: 'fail',
        }),
      ]),
    )
  })

  it('fails production rollout when external mock adapter is configured', () => {
    const rollout = evaluateAuthRollout(
      createInput({
        authExternalAdapter: 'mock',
        authExternalJwtSecret: 'mock-secret',
      }),
    )

    expect(rollout.status).toBe('not_ready')
    expect(rollout.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'external_auth_adapter',
          status: 'fail',
        }),
      ]),
    )
  })
})
