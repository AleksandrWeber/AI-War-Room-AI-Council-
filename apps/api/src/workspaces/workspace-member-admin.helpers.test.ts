import { describe, expect, it } from 'vitest'
import { buildWorkspaceMemberAdminStats } from './workspace-member-admin.helpers.js'

describe('workspace member admin helpers', () => {
  it('builds member admin stats', () => {
    expect(
      buildWorkspaceMemberAdminStats([
        {
          userId: 'user_owner',
          role: 'owner',
          email: null,
          displayName: null,
        },
        {
          userId: 'user_admin',
          role: 'admin',
          email: null,
          displayName: null,
        },
        {
          userId: 'user_member',
          role: 'member',
          email: null,
          displayName: null,
        },
      ]),
    ).toEqual({
      memberCount: 3,
      ownerCount: 1,
      adminCount: 1,
    })
  })
})
