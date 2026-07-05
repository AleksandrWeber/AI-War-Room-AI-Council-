import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { RunHistoryAdminService } from './run-history-admin.service.js'
import { RunsService } from './runs.service.js'

class TestRunsService {
  listArtifactHistory = async (workspaceId: string) => ({
    workspaceId,
    artifacts: [],
  })
}

function createRunHistoryAdminService(env: Partial<ApiEnv> = {}) {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    ...env,
  })

  return new RunHistoryAdminService(
    configService,
    new TestRunsService() as unknown as RunsService,
  )
}

describe('RunHistoryAdminService', () => {
  it('reports run history capabilities', () => {
    const service = createRunHistoryAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsRunHistoryRollout: true,
      supportsRunHistoryAdminTools: true,
      supportsMarkdownExport: true,
    })
  })

  it('reports run history rollout readiness', () => {
    const service = createRunHistoryAdminService()

    expect(service.getRunHistoryRollout()).toMatchObject({
      status: 'ready',
    })
  })

  it('returns workspace run history admin summary for owners', async () => {
    const service = createRunHistoryAdminService()

    await expect(
      service.getWorkspaceRunHistoryAdminSummary(
        {
          userId: 'user_test',
          workspaceId: 'workspace_1',
          role: 'owner',
        },
        'workspace_1',
      ),
    ).resolves.toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalArtifacts: 0,
      },
    })
  })

  it('rejects run history admin tools for members', async () => {
    const service = createRunHistoryAdminService()

    await expect(
      service.getWorkspaceRunHistoryAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message: 'Only workspace owners and admins can manage run history tools.',
      },
    })
  })
})
