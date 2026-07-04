import { describe, expect, it } from 'vitest'
import {
  authSessionClaimsSchema,
  authSessionResponseSchema,
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
})
