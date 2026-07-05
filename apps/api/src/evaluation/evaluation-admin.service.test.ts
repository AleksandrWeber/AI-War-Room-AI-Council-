import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { EvaluationAdminService } from './evaluation-admin.service.js'

function createEvaluationAdminService(env: Partial<ApiEnv> = {}) {
  return new EvaluationAdminService(
    new ConfigService<ApiEnv>({
      NODE_ENV: 'test',
      ...env,
    }),
  )
}

describe('EvaluationAdminService', () => {
  it('reports prompt evaluation capabilities', () => {
    const service = createEvaluationAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsPromptEvaluationRollout: true,
      supportsPromptRegressionAdminTools: true,
      regressionDatasetCaseCount: 6,
    })
  })

  it('reports prompt evaluation rollout readiness', async () => {
    const service = createEvaluationAdminService()

    await expect(service.getPromptEvaluationRollout()).resolves.toMatchObject({
      status: 'ready',
    })
  })

  it('returns workspace prompt regression admin summary for owners', async () => {
    const service = createEvaluationAdminService()

    await expect(
      service.getWorkspacePromptRegressionAdminSummary(
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
        totalCases: 6,
      },
      availableActions: ['rerun_prompt_regression'],
    })
  })

  it('rejects prompt regression admin tools for members', async () => {
    const service = createEvaluationAdminService()

    await expect(
      service.getWorkspacePromptRegressionAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message:
          'Only workspace owners and admins can manage prompt regression tools.',
      },
    })
  })
})
