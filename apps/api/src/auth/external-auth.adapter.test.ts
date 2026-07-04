import { describe, expect, it } from 'vitest'
import {
  createMockExternalAuthToken,
  getExternalAuthCapabilityGuidance,
  verifyExternalAuthToken,
} from './external-auth.adapter.js'

describe('external auth adapter', () => {
  it('verifies mock clerk tokens and maps workspace claims', async () => {
    const token = await createMockExternalAuthToken({
      secret: 'external-test-secret',
      vendor: 'clerk',
      subject: 'user_external',
      workspaceId: 'workspace_1',
      issuer: 'ai-war-room-external-auth',
      audience: 'ai-war-room-api',
    })

    await expect(
      verifyExternalAuthToken({
        token,
        env: {
          AUTH_EXTERNAL_ADAPTER: 'mock',
          AUTH_EXTERNAL_VENDOR: 'clerk',
          AUTH_EXTERNAL_JWT_SECRET: 'external-test-secret',
          AUTH_EXTERNAL_JWKS_URL: undefined,
          AUTH_EXTERNAL_ISSUER: 'ai-war-room-external-auth',
          AUTH_EXTERNAL_AUDIENCE: 'ai-war-room-api',
          AUTH_EXTERNAL_USER_ID_CLAIM: 'sub',
          AUTH_EXTERNAL_WORKSPACE_ID_CLAIM: 'org_id',
        },
      }),
    ).resolves.toMatchObject({
      userId: 'clerk_user_external',
      workspaceId: 'workspace_1',
      vendor: 'clerk',
    })
  })

  it('returns vendor-specific capability guidance', () => {
    expect(getExternalAuthCapabilityGuidance('auth0', 'jwks')).toContain('Auth0')
  })
})
