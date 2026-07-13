import { beforeEach, describe, expect, it } from 'vitest'
import { WorkspaceService } from './workspace.service.js'
import { InMemoryWorkspaceRepository } from './in-memory-workspace.repository.js'
import { UserProvisioningService } from './user-provisioning.service.js'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'

describe('WorkspaceService.listMyWorkspaces', () => {
  let service: WorkspaceService

  beforeEach(() => {
    const repository = new InMemoryWorkspaceRepository()
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

  it('lists memberships with workspace names for the user', async () => {
    const listed = await service.listMyWorkspaces('user_local')
    expect(listed.userId).toBe('user_local')
    expect(listed.workspaces.map((entry) => entry.workspaceId).sort()).toEqual([
      'local_workspace',
      'secondary_workspace',
    ])
    expect(
      listed.workspaces.find((entry) => entry.workspaceId === 'local_workspace'),
    ).toMatchObject({
      name: 'Local Workspace',
      role: 'owner',
    })
  })
})
