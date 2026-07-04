import { describe, expect, it } from 'vitest'
import {
  authCapabilitiesResponseSchema,
  authProviderRequiresBearerToken,
  authProviderSupportsSessionBootstrap,
  authProviderWorkspaceHeadersRequired,
  getAuthProviderGuidance,
} from './auth-provider.js'

describe('auth provider helpers', () => {
  it('returns guidance for each provider mode', () => {
    expect(getAuthProviderGuidance('headers')).toContain('x-user-id')
    expect(getAuthProviderGuidance('bearer')).toContain('Authorization')
    expect(getAuthProviderGuidance('session')).toContain('/api/auth/session')
    expect(getAuthProviderGuidance('external')).toContain('clerk')
  })

  it('derives capability flags from provider mode', () => {
    expect(authProviderRequiresBearerToken('external')).toBe(true)
    expect(authProviderWorkspaceHeadersRequired('external')).toBe(false)
    expect(authProviderSupportsSessionBootstrap('external')).toBe(false)
  })

  it('validates auth capabilities responses', () => {
    expect(
      authCapabilitiesResponseSchema.parse({
        provider: 'external',
        requiresBearerToken: true,
        supportsSessionBootstrap: false,
        supportsExternalProvisioning: true,
        workspaceHeadersRequired: false,
        externalVendor: 'clerk',
        externalAdapter: 'jwks',
        guidance: getAuthProviderGuidance('external'),
      }),
    ).toMatchObject({
      provider: 'external',
      externalVendor: 'clerk',
    })
  })
})
