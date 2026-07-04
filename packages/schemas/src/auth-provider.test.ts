import { describe, expect, it } from 'vitest'
import {
  authCapabilitiesResponseSchema,
  getAuthProviderGuidance,
} from './auth-provider.js'

describe('auth provider helpers', () => {
  it('returns guidance for each provider mode', () => {
    expect(getAuthProviderGuidance('headers')).toContain('x-user-id')
    expect(getAuthProviderGuidance('bearer')).toContain('Authorization')
  })

  it('validates auth capabilities responses', () => {
    expect(
      authCapabilitiesResponseSchema.parse({
        provider: 'bearer',
        requiresBearerToken: true,
        workspaceHeadersRequired: true,
        guidance: getAuthProviderGuidance('bearer'),
      }),
    ).toMatchObject({
      provider: 'bearer',
      requiresBearerToken: true,
    })
  })
})
