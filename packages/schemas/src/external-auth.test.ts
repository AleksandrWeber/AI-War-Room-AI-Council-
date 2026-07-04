import { describe, expect, it } from 'vitest'
import {
  getDefaultExternalWorkspaceClaim,
  mapExternalUserId,
  resolveExternalAuthClaims,
} from './external-auth.js'

describe('external auth helpers', () => {
  it('maps vendor subjects to internal user ids', () => {
    expect(mapExternalUserId('clerk', 'user_123')).toBe('clerk_user_123')
  })

  it('resolves clerk org claims into workspace identity', () => {
    expect(
      resolveExternalAuthClaims({
        vendor: 'clerk',
        userIdClaim: 'sub',
        workspaceIdClaim: 'org_id',
        payload: {
          sub: 'user_123',
          org_id: 'workspace_1',
          email: 'dev@example.com',
        },
      }),
    ).toMatchObject({
      userId: 'clerk_user_123',
      workspaceId: 'workspace_1',
      vendor: 'clerk',
    })
  })

  it('uses vendor-specific default workspace claims', () => {
    expect(getDefaultExternalWorkspaceClaim('auth0')).toContain('workspace_id')
  })
})
