import { ConfigService } from '@nestjs/config'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { WorkspaceInviteService } from './workspace-invite.service.js'
import { InMemoryWorkspaceRepository } from './in-memory-workspace.repository.js'

describe('WorkspaceInviteService', () => {
  let service: WorkspaceInviteService
  let repository: InMemoryWorkspaceRepository

  beforeEach(() => {
    repository = new InMemoryWorkspaceRepository()
    service = new WorkspaceInviteService(
      new ConfigService<ApiEnv>({
        NODE_ENV: 'test',
        WEB_ORIGIN: 'http://127.0.0.1:5173',
      }),
      {} as never,
      repository,
    )
  })

  it('creates a link-only invite and accepts it for an authenticated user', async () => {
    const created = await service.createInvite({
      authContext: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      workspaceId: 'workspace_1',
      body: {
        email: 'new.member@example.com',
        role: 'member',
      },
    })

    expect(created.delivery).toBe('link_only')
    expect(created.token.length).toBeGreaterThan(16)
    expect(created.inviteUrl).toContain(created.token)
    expect(created.invite.status).toBe('pending')

    const listed = await service.listInvites({
      authContext: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      workspaceId: 'workspace_1',
    })
    expect(listed.invites).toHaveLength(1)

    const accepted = await service.acceptInvite({
      authContext: {
        userId: 'user_invitee',
        workspaceId: 'workspace_1',
        role: 'member',
      },
      body: { token: created.token },
    })

    expect(accepted.workspaceId).toBe('workspace_1')
    expect(accepted.role).toBe('member')
    expect(accepted.memberUserId).toBe('user_invitee')

    const members = await repository.listWorkspaceMembers('workspace_1')
    expect(members.some((member) => member.userId === 'user_invitee')).toBe(
      true,
    )
  })
})
