import { describe, expect, it } from 'vitest'
import {
  authSessionClaimsSchema,
  authSessionResponseSchema,
  resolvePreferredActiveWorkspaceId,
} from './auth-session.js'

describe('auth session schemas', () => {
  it('validates session claims and responses', () => {
    expect(
      authSessionClaimsSchema.parse({
        userId: 'user_local',
        workspaceId: 'local_workspace',
        exp: 1_700_003_600,
      }),
    ).toMatchObject({
      userId: 'user_local',
    })

    expect(
      authSessionResponseSchema.parse({
        token: 'signed-token',
        expiresAt: 1_700_003_600,
        userId: 'user_local',
        workspaceId: 'local_workspace',
      }),
    ).toMatchObject({
      token: 'signed-token',
    })
  })

  it('prefers session workspace when it is still in mine', () => {
    expect(
      resolvePreferredActiveWorkspaceId({
        mineWorkspaceIds: ['local_workspace', 'secondary_workspace'],
        sessionWorkspaceId: 'secondary_workspace',
        storedActiveWorkspaceId: 'local_workspace',
      }),
    ).toEqual({
      workspaceId: 'secondary_workspace',
      source: 'session',
    })
  })

  it('falls back when session and stored workspaces are stale', () => {
    expect(
      resolvePreferredActiveWorkspaceId({
        mineWorkspaceIds: ['local_workspace', 'secondary_workspace'],
        sessionWorkspaceId: 'missing_session',
        storedActiveWorkspaceId: 'missing_stored',
        fallbackWorkspaceId: 'local_workspace',
      }),
    ).toEqual({
      workspaceId: 'local_workspace',
      source: 'fallback',
    })
  })
})
