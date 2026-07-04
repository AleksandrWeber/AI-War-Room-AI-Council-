import { describe, expect, it } from 'vitest'
import {
  authCapabilitiesResponseSchema,
  authProviderRequiresBearerToken,
  authProviderWorkspaceHeadersRequired,
  getAuthProviderGuidance,
} from './auth-provider.js'

describe('auth provider helpers', () => {
  it('returns guidance for each provider mode', () => {
    expect(getAuthProviderGuidance('headers')).toContain('x-user-id')
    expect(getAuthProviderGuidance('bearer')).toContain('Authorization')
    expect(getAuthProviderGuidance('session')).toContain('/api/auth/session')
  })

  it('derives capability flags from provider mode', () => {
    expect(authProviderRequiresBearerToken('session')).toBe(true)
    expect(authProviderWorkspaceHeadersRequired('session')).toBe(false)
  })

  it('validates auth capabilities responses', () => {
    expect(
      authCapabilitiesResponseSchema.parse({
        provider: 'session',
        requiresBearerToken: true,
        supportsSessionBootstrap: true,
        workspaceHeadersRequired: false,
        guidance: getAuthProviderGuidance('session'),
      }),
    ).toMatchObject({
      provider: 'session',
      requiresBearerToken: true,
    })
  })
})
