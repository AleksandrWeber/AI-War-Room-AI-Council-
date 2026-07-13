import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RunFeedbackService } from './run-feedback.service.js'

describe('RunFeedbackService', () => {
  const runRepository = {
    findArtifactById: vi.fn(),
    listArtifacts: vi.fn(),
  }
  const postgresService = {
    query: vi.fn(),
  }
  const observabilityService = {
    record: vi.fn(),
  }
  const configService = {
    get: vi.fn(() => 'test'),
  }

  let service: RunFeedbackService

  beforeEach(() => {
    vi.clearAllMocks()
    configService.get.mockReturnValue('test')
    service = new RunFeedbackService(
      configService as never,
      postgresService as never,
      observabilityService as never,
      runRepository as never,
    )
  })

  it('records artifact usefulness feedback and upserts on repeat', async () => {
    runRepository.findArtifactById.mockResolvedValue({
      artifactId: 'artifact_1',
      runId: 'run_1',
      workspaceId: 'workspace_1',
    })

    const first = await service.createFeedback({
      authContext: {
        userId: 'user_local',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      body: {
        targetType: 'artifact',
        runId: 'run_1',
        artifactId: 'artifact_1',
        usefulness: 'useful',
        comment: 'PRD was actionable',
      },
    })

    expect(first).toMatchObject({
      targetType: 'artifact',
      usefulness: 'useful',
      comment: 'PRD was actionable',
    })
    expect(observabilityService.record).toHaveBeenCalledWith(
      'run_feedback_recorded',
      expect.objectContaining({ usefulness: 'useful' }),
    )

    const second = await service.createFeedback({
      authContext: {
        userId: 'user_local',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      body: {
        targetType: 'artifact',
        runId: 'run_1',
        artifactId: 'artifact_1',
        usefulness: 'partially_useful',
      },
    })

    expect(second.feedbackId).toBe(first.feedbackId)
    expect(second.usefulness).toBe('partially_useful')
    expect(second.createdAt).toBe(first.createdAt)
  })

  it('records run-level feedback when artifacts exist for the run', async () => {
    runRepository.listArtifacts.mockResolvedValue([
      { artifactId: 'artifact_1', runId: 'run_2', workspaceId: 'workspace_1' },
    ])

    await expect(
      service.createFeedback({
        authContext: {
          userId: 'user_local',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        body: {
          targetType: 'run',
          runId: 'run_2',
          usefulness: 'not_useful',
          comment: 'Agents missed the market risk',
        },
      }),
    ).resolves.toMatchObject({
      targetType: 'run',
      usefulness: 'not_useful',
      artifactId: null,
    })
  })

  it('rejects artifact feedback when the artifact is missing', async () => {
    runRepository.findArtifactById.mockResolvedValue(null)

    await expect(
      service.createFeedback({
        authContext: {
          userId: 'user_local',
          workspaceId: 'workspace_1',
          role: 'owner',
        },
        body: {
          targetType: 'artifact',
          runId: 'run_1',
          artifactId: 'missing',
          usefulness: 'useful',
        },
      }),
    ).rejects.toMatchObject({ status: 404 })
  })
})
