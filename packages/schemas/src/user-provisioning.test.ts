import { describe, expect, it } from 'vitest'
import { userProvisioningResponseSchema } from './user-provisioning.js'

describe('user provisioning schemas', () => {
  it('validates provisioning responses', () => {
    expect(
      userProvisioningResponseSchema.parse({
        userId: 'clerk_user_123',
        workspaceId: 'workspace_1',
        role: 'owner',
        actions: ['created_user', 'created_workspace', 'created_membership'],
        provisionedAt: '2026-07-04T12:00:00.000Z',
      }),
    ).toMatchObject({
      userId: 'clerk_user_123',
      role: 'owner',
    })
  })
})
