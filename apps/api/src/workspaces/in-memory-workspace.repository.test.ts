import { describe, expect, it } from 'vitest'
import { InMemoryWorkspaceRepository } from './in-memory-workspace.repository.js'

describe('InMemoryWorkspaceRepository provisioning', () => {
  it('creates users, workspaces, and owner memberships for new external users', async () => {
    const repository = new InMemoryWorkspaceRepository()

    await expect(
      repository.provisionExternalMember({
        userId: 'clerk_user_new',
        workspaceId: 'workspace_external_new',
        email: 'new@example.com',
        displayName: 'user_new',
      }),
    ).resolves.toMatchObject({
      userId: 'clerk_user_new',
      workspaceId: 'workspace_external_new',
      role: 'owner',
      actions: ['created_user', 'created_workspace', 'created_membership'],
    })

    await expect(
      repository.findMembership('clerk_user_new', 'workspace_external_new'),
    ).resolves.toMatchObject({
      role: 'owner',
    })
  })

  it('adds members to existing workspaces without changing owner role', async () => {
    const repository = new InMemoryWorkspaceRepository()

    await repository.provisionExternalMember({
      userId: 'clerk_user_joiner',
      workspaceId: 'workspace_1',
      email: 'joiner@example.com',
    })

    await expect(
      repository.findMembership('clerk_user_joiner', 'workspace_1'),
    ).resolves.toMatchObject({
      role: 'member',
    })
  })
})
