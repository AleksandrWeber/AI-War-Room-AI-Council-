import { ConfigService } from '@nestjs/config'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { InMemoryWorkspaceRepository } from './in-memory-workspace.repository.js'
import { UserProvisioningService } from './user-provisioning.service.js'
import { WorkspaceService } from './workspace.service.js'

describe('WorkspaceService create/leave', () => {
  let service: WorkspaceService
  let repository: InMemoryWorkspaceRepository

  beforeEach(() => {
    repository = new InMemoryWorkspaceRepository()
    service = new WorkspaceService(
      repository,
      new UserProvisioningService(
        repository,
        new ConfigService<ApiEnv>({
          NODE_ENV: 'test',
          AUTH_EXTERNAL_AUTO_PROVISION: false,
        }),
      ),
    )
  })

  it('creates a workspace owned by the caller and lists it', async () => {
    const created = await service.createWorkspace({
      userId: 'user_local',
      body: { name: 'Fresh Lab' },
    })

    expect(created.workspace.name).toBe('Fresh Lab')
    expect(created.workspace.role).toBe('owner')
    expect(created.workspace.workspaceId.startsWith('workspace_')).toBe(true)

    const listed = await service.listMyWorkspaces('user_local')
    expect(
      listed.workspaces.some(
        (workspace) => workspace.workspaceId === created.workspace.workspaceId,
      ),
    ).toBe(true)
  })

  it('allows a non-sole-owner member to leave a workspace', async () => {
    const left = await service.leaveWorkspace({
      authContext: {
        userId: 'user_local',
        workspaceId: 'secondary_workspace',
        role: 'member',
      },
      workspaceId: 'secondary_workspace',
    })

    expect(left.workspaceId).toBe('secondary_workspace')
    const listed = await service.listMyWorkspaces('user_local')
    expect(
      listed.workspaces.some(
        (workspace) => workspace.workspaceId === 'secondary_workspace',
      ),
    ).toBe(false)
  })

  it('blocks the sole owner from leaving', async () => {
    await expect(
      service.leaveWorkspace({
        authContext: {
          userId: 'user_local',
          workspaceId: 'local_workspace',
          role: 'owner',
        },
        workspaceId: 'local_workspace',
      }),
    ).rejects.toMatchObject({
      response: { message: 'Workspace must keep at least one owner.' },
    })
  })

  it('archives a sole-owned workspace and hides it from mine', async () => {
    const created = await service.createWorkspace({
      userId: 'user_local',
      body: { name: 'Archive Me' },
    })

    const archived = await service.archiveWorkspace({
      authContext: {
        userId: 'user_local',
        workspaceId: created.workspace.workspaceId,
        role: 'owner',
      },
      workspaceId: created.workspace.workspaceId,
    })

    expect(archived.workspaceId).toBe(created.workspace.workspaceId)
    const listed = await service.listMyWorkspaces('user_local')
    expect(
      listed.workspaces.some(
        (workspace) => workspace.workspaceId === created.workspace.workspaceId,
      ),
    ).toBe(false)
  })

  it('blocks non-owners from archiving', async () => {
    await expect(
      service.archiveWorkspace({
        authContext: {
          userId: 'user_local',
          workspaceId: 'secondary_workspace',
          role: 'member',
        },
        workspaceId: 'secondary_workspace',
      }),
    ).rejects.toMatchObject({
      response: {
        message: 'Only workspace owners can archive this workspace.',
      },
    })
  })

  it('blocks archive when active runs exist', async () => {
    const created = await service.createWorkspace({
      userId: 'user_local',
      body: { name: 'Busy Lab' },
    })
    repository.setActiveRunCount(created.workspace.workspaceId, 2)

    await expect(
      service.archiveWorkspace({
        authContext: {
          userId: 'user_local',
          workspaceId: created.workspace.workspaceId,
          role: 'owner',
        },
        workspaceId: created.workspace.workspaceId,
      }),
    ).rejects.toMatchObject({
      response: {
        message:
          'Cannot archive a workspace while draft, pending, or running runs exist.',
      },
    })
  })
})
