import { describe, expect, it } from 'vitest'
import {
  buildAuthSessionResponse,
  createAuthSessionToken,
  verifyAuthSessionToken,
} from './auth-session.crypto.js'

describe('auth session crypto', () => {
  it('creates and verifies signed session tokens', () => {
    const token = createAuthSessionToken({
      secret: 'test-secret',
      claims: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        exp: 4_000_000_000,
      },
    })

    expect(
      verifyAuthSessionToken({
        token,
        secret: 'test-secret',
        now: 1_700_000_000,
      }),
    ).toEqual({
      userId: 'user_test',
      workspaceId: 'workspace_1',
      exp: 4_000_000_000,
    })
  })

  it('rejects expired session tokens', () => {
    const token = createAuthSessionToken({
      secret: 'test-secret',
      claims: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        exp: 1_700_000_000,
      },
    })

    expect(() =>
      verifyAuthSessionToken({
        token,
        secret: 'test-secret',
        now: 1_700_000_001,
      }),
    ).toThrow('expired')
  })

  it('builds session responses with expiry metadata', () => {
    expect(
      buildAuthSessionResponse({
        userId: 'user_local',
        workspaceId: 'local_workspace',
        secret: 'test-secret',
        ttlSeconds: 3_600,
        now: 1_700_000_000,
      }),
    ).toMatchObject({
      userId: 'user_local',
      workspaceId: 'local_workspace',
      expiresAt: 1_700_003_600,
    })
  })
})
