import { ConfigService } from '@nestjs/config'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { MockInviteEmailAdapter } from './invite-email.adapter.js'
import { WorkspaceInviteService } from './workspace-invite.service.js'
import { InMemoryWorkspaceRepository } from './in-memory-workspace.repository.js'

describe('WorkspaceInviteService', () => {
  let service: WorkspaceInviteService
  let repository: InMemoryWorkspaceRepository
  let inviteEmailAdapter: MockInviteEmailAdapter

  beforeEach(() => {
    repository = new InMemoryWorkspaceRepository()
    inviteEmailAdapter = new MockInviteEmailAdapter()
    service = new WorkspaceInviteService(
      new ConfigService<ApiEnv>({
        NODE_ENV: 'test',
        WEB_ORIGIN: 'http://127.0.0.1:5173',
        INVITE_EMAIL_ADAPTER: 'mock',
      }),
      {} as never,
      repository,
      inviteEmailAdapter,
    )
  })

  it('creates a mock-delivered invite and accepts it when emails match', async () => {
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

    expect(created.delivery).toBe('mock')
    expect(inviteEmailAdapter.lastSent).toHaveLength(1)
    expect(inviteEmailAdapter.lastSent[0]?.to).toBe('new.member@example.com')
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

    await repository.addWorkspaceMember({
      workspaceId: 'workspace_other',
      userId: 'user_invitee',
      role: 'member',
      email: 'new.member@example.com',
      displayName: 'Invitee',
    })

    const accepted = await service.acceptInvite({
      authContext: {
        userId: 'user_invitee',
        workspaceId: 'workspace_other',
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

  it('rejects accept when authenticated email does not match the invite', async () => {
    const created = await service.createInvite({
      authContext: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      workspaceId: 'workspace_1',
      body: {
        email: 'intended@example.com',
        role: 'member',
      },
    })

    await expect(
      service.acceptInvite({
        authContext: {
          userId: 'user_local',
          workspaceId: 'local_workspace',
          role: 'owner',
        },
        body: { token: created.token },
      }),
    ).rejects.toMatchObject({
      response: {
        message:
          'This invite was issued for intended@example.com. Sign in as that email to accept.',
      },
    })
  })

  it('rejects accept when the authenticated user has no email on file', async () => {
    const created = await service.createInvite({
      authContext: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      workspaceId: 'workspace_1',
      body: {
        email: 'ghost@example.com',
        role: 'viewer',
      },
    })

    await expect(
      service.acceptInvite({
        authContext: {
          userId: 'user_without_email',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        body: { token: created.token },
      }),
    ).rejects.toMatchObject({
      response: {
        message:
          'Your account has no email on file. Sign in with an email identity before accepting an invite.',
      },
    })
  })

  it('resends a pending invite and invalidates the previous token', async () => {
    const created = await service.createInvite({
      authContext: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      workspaceId: 'workspace_1',
      body: {
        email: 'rotate.me@example.com',
        role: 'member',
        expiresInHours: 24,
      },
    })

    const resent = await service.resendInvite({
      authContext: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      workspaceId: 'workspace_1',
      inviteId: created.invite.inviteId,
      body: { expiresInHours: 48 },
    })

    expect(resent.token).not.toBe(created.token)
    expect(resent.invite.status).toBe('pending')
    expect(resent.delivery).toBe('mock')
    expect(inviteEmailAdapter.lastSent).toHaveLength(2)

    await repository.addWorkspaceMember({
      workspaceId: 'workspace_other',
      userId: 'user_rotatee',
      role: 'member',
      email: 'rotate.me@example.com',
    })

    await expect(
      service.acceptInvite({
        authContext: {
          userId: 'user_rotatee',
          workspaceId: 'workspace_other',
          role: 'member',
        },
        body: { token: created.token },
      }),
    ).rejects.toMatchObject({
      response: { message: 'Invite token was not found.' },
    })

    const accepted = await service.acceptInvite({
      authContext: {
        userId: 'user_rotatee',
        workspaceId: 'workspace_other',
        role: 'member',
      },
      body: { token: resent.token },
    })
    expect(accepted.workspaceId).toBe('workspace_1')
  })

  it('accepts without demoting an existing higher-privilege membership', async () => {
    const created = await service.createInvite({
      authContext: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      workspaceId: 'workspace_1',
      body: {
        email: 'test@ai-war-room.dev',
        role: 'viewer',
      },
    })

    const accepted = await service.acceptInvite({
      authContext: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      body: { token: created.token },
    })

    expect(accepted.role).toBe('owner')
    expect(accepted.guidance).toContain('already had access')

    const members = await repository.listWorkspaceMembers('workspace_1')
    expect(
      members.find((member) => member.userId === 'user_test')?.role,
    ).toBe('owner')
  })

  it('revokes a pending invite so the token cannot be accepted', async () => {
    const created = await service.createInvite({
      authContext: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      workspaceId: 'workspace_1',
      body: {
        email: 'revoke.me@example.com',
        role: 'viewer',
      },
    })

    const revoked = await service.revokeInvite({
      authContext: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      workspaceId: 'workspace_1',
      inviteId: created.invite.inviteId,
    })

    expect(revoked.invite.status).toBe('revoked')

    await repository.addWorkspaceMember({
      workspaceId: 'workspace_other',
      userId: 'user_invitee',
      role: 'member',
      email: 'revoke.me@example.com',
    })

    await expect(
      service.acceptInvite({
        authContext: {
          userId: 'user_invitee',
          workspaceId: 'workspace_other',
          role: 'member',
        },
        body: { token: created.token },
      }),
    ).rejects.toMatchObject({
      response: { message: 'Invite is revoked and cannot be accepted.' },
    })
  })
})
