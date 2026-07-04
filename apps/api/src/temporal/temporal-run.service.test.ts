import type { ConfigService } from '@nestjs/config'
import type { MockPipelineRequest } from '@ai-war-room/schemas'
import { describe, expect, it, vi } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import type { ObservabilityService } from '../observability/observability.service.js'
import { InMemoryTemporalWorkflowRepository } from '../persistence/in-memory-temporal-workflow.repository.js'
import type { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import type { PipelineStreamEvent } from '../runs/pipeline-stream-event.js'
import type { TemporalRunClient } from './temporal-run-client.js'
import { TemporalRunService } from './temporal-run.service.js'

const now = '2026-01-01T00:00:00.000Z'
const authContext = {
  userId: 'user_test',
  workspaceId: 'workspace_1',
  role: 'owner' as const,
}

function createConfigService(enabled: boolean) {
  const values = {
    TEMPORAL_ENABLED: enabled,
    TEMPORAL_ADDRESS: '127.0.0.1:7233',
    TEMPORAL_NAMESPACE: 'default',
    TEMPORAL_TASK_QUEUE: 'ai-war-room-runs',
  }

  return {
    get(key: keyof typeof values) {
      return values[key]
    },
  } as ConfigService<ApiEnv, true>
}

function createObservabilityService() {
  return {
    measure(
      _eventName: string,
      _attributes: Record<string, string | number | boolean | null>,
      operation: () => Promise<unknown>,
    ) {
      return operation()
    },
  } as ObservabilityService
}

function createStreamEventBufferService() {
  const events: PipelineStreamEvent[] = []

  return {
    append: vi.fn(async (input: { event: PipelineStreamEvent }) => {
      const event = {
        ...input.event,
        eventId: `${Date.now()}-${events.length + 1}`,
      }
      events.push(event)

      return event
    }),
    replayAfter: vi.fn(async () => events),
    replayAll: vi.fn(async () => events),
  } as unknown as StreamEventBufferService
}

function createRequest(): MockPipelineRequest {
  const triage = {
    domain: 'saas' as const,
    subdomain: 'AI planning',
    complexity: 'medium' as const,
    marketConfidence: 'medium' as const,
    securitySensitivity: 'medium' as const,
    recommendedRunMode: 'standard' as const,
    recommendedAgents: [
      'product_manager',
      'critic',
      'software_architect',
    ] as const,
    estimatedDurationSeconds: 180,
    estimatedMaxCostUsd: 0.5,
    reasoningSummary: 'Run the core approved planning workflow.',
  }

  return {
    draftRun: {
      runId: 'run_temporal_start_1',
      workspaceId: 'workspace_1',
      status: 'draft',
      idea: {
        rawIdea: 'Build durable workflow orchestration for AI War Room.',
        strategicGoals: [],
        technicalPreferences: [],
        constraints: [],
        references: [],
      },
      shieldScan: {
        scanId: 'scan_1',
        status: 'clear',
        maxSeverity: 'none',
        findings: [],
      },
      triage,
      selectedAgents: [...triage.recommendedAgents],
      estimatedDurationSeconds: triage.estimatedDurationSeconds,
      estimatedMaxCostUsd: triage.estimatedMaxCostUsd,
      createdAt: now,
      updatedAt: now,
    },
    approvedTriage: triage,
    selectedAgents: [...triage.recommendedAgents],
  }
}

function createService(input: {
  enabled: boolean
  temporalRunClient: TemporalRunClient
}) {
  const temporalWorkflowRepository = new InMemoryTemporalWorkflowRepository()
  const streamEventBufferService = createStreamEventBufferService()
  const service = new TemporalRunService(
    createConfigService(input.enabled),
    createObservabilityService(),
    streamEventBufferService,
    temporalWorkflowRepository,
    input.temporalRunClient,
  )

  return {
    service,
    temporalWorkflowRepository,
    streamEventBufferService,
  }
}

describe('TemporalRunService', () => {
  it('starts an approved run through the Temporal client adapter', async () => {
    const request = createRequest()
    const startDurableRun = vi.fn(async () => ({
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      temporalRunId: 'temporal_run_1',
    }))
    const { service, temporalWorkflowRepository } = createService({
      enabled: true,
      temporalRunClient: {
        startDurableRun,
        describeDurableRun: vi.fn(),
      },
    })

    await expect(service.startApprovedRun(request, authContext)).resolves.toMatchObject({
      runId: 'run_temporal_start_1',
      workspaceId: 'workspace_1',
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      temporalRunId: 'temporal_run_1',
      taskQueue: 'ai-war-room-runs',
      status: 'running',
      temporalEnabled: true,
    })
    expect(startDurableRun).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '127.0.0.1:7233',
        namespace: 'default',
        taskQueue: 'ai-war-room-runs',
        workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
        input: expect.objectContaining({
          request,
          authContext,
        }),
      }),
    )
    await expect(
      temporalWorkflowRepository.findWorkflowById({
        workspaceId: 'workspace_1',
        workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      }),
    ).resolves.toMatchObject({
      runId: 'run_temporal_start_1',
      status: 'running',
    })
  })

  it('maps Temporal workflow status into API status response', async () => {
    const describeDurableRun = vi.fn(async () => ({
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      temporalRunId: 'temporal_run_1',
      status: 'WORKFLOW_EXECUTION_STATUS_COMPLETED',
    }))
    const { service, temporalWorkflowRepository } = createService({
      enabled: true,
      temporalRunClient: {
        startDurableRun: vi.fn(),
        describeDurableRun,
      },
    })
    await temporalWorkflowRepository.saveStartedWorkflow({
      runId: 'run_temporal_start_1',
      workspaceId: 'workspace_1',
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      temporalRunId: 'temporal_run_1',
      taskQueue: 'ai-war-room-runs',
      status: 'running',
      startedAt: now,
    })

    await expect(
      service.getWorkflowStatus({
        workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
        authContext,
      }),
    ).resolves.toMatchObject({
      runId: 'run_temporal_start_1',
      workspaceId: 'workspace_1',
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      temporalRunId: 'temporal_run_1',
      taskQueue: 'ai-war-room-runs',
      status: 'completed',
      temporalEnabled: true,
    })
    expect(describeDurableRun).toHaveBeenCalledWith({
      address: '127.0.0.1:7233',
      namespace: 'default',
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
    })
    await expect(
      temporalWorkflowRepository.findWorkflowById({
        workspaceId: 'workspace_1',
        workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      }),
    ).resolves.toMatchObject({
      status: 'completed',
      completedAt: expect.any(String),
    })
  })

  it('returns persisted workflow observation and workflow stream events', async () => {
    const request = createRequest()
    const { service, streamEventBufferService } = createService({
      enabled: true,
      temporalRunClient: {
        startDurableRun: vi.fn(async () => ({
          workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
          temporalRunId: 'temporal_run_1',
        })),
        describeDurableRun: vi.fn(),
      },
    })

    const startResponse = await service.startApprovedRun(request, authContext)

    await expect(
      service.getWorkflowObservation({
        workflowId: startResponse.workflowId,
        authContext,
      }),
    ).resolves.toMatchObject({
      workflow: {
        workflowId: startResponse.workflowId,
        status: 'running',
      },
    })

    await expect(
      service.getWorkflowStreamEvents({
        workflowId: startResponse.workflowId,
        authContext,
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        type: 'workflow_status',
        workflowId: startResponse.workflowId,
        status: 'running',
      }),
    ])
    expect(streamEventBufferService.append).toHaveBeenCalled()
  })

  it('replays buffered pipeline events from the workflow stream endpoint', async () => {
    const request = createRequest()
    const { service, streamEventBufferService } = createService({
      enabled: true,
      temporalRunClient: {
        startDurableRun: vi.fn(async () => ({
          workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
          temporalRunId: 'temporal_run_1',
        })),
        describeDurableRun: vi.fn(),
      },
    })
    const startResponse = await service.startApprovedRun(request, authContext)
    const pipelineEvent = {
      eventId: 'event_pipeline_1',
      type: 'status' as const,
      stepId: 'agent_pool',
      label: 'Prompt-driven agent pool',
      status: 'running' as const,
      timestamp: now,
    }

    vi.mocked(streamEventBufferService.replayAll).mockResolvedValueOnce([pipelineEvent])

    await expect(
      service.getWorkflowStreamEvents({
        workflowId: startResponse.workflowId,
        authContext,
      }),
    ).resolves.toEqual([pipelineEvent])
    expect(streamEventBufferService.replayAll).toHaveBeenCalledWith({
      workspaceId: 'workspace_1',
      runId: 'run_temporal_start_1',
    })
  })

  it('keeps workflow start disabled until Temporal is explicitly enabled', async () => {
    const startDurableRun = vi.fn()
    const { service } = createService({
      enabled: false,
      temporalRunClient: {
        startDurableRun,
        describeDurableRun: vi.fn(),
      },
    })

    await expect(service.startApprovedRun(createRequest(), authContext)).rejects.toMatchObject({
      status: 503,
    })
    expect(startDurableRun).not.toHaveBeenCalled()
  })

  it('rejects workflow IDs outside the current workspace', async () => {
    const describeDurableRun = vi.fn()
    const { service } = createService({
      enabled: true,
      temporalRunClient: {
        startDurableRun: vi.fn(),
        describeDurableRun,
      },
    })

    await expect(
      service.getWorkflowStatus({
        workflowId: 'ai-war-room-workspace_other-run_temporal_start_1',
        authContext,
      }),
    ).rejects.toMatchObject({
      status: 403,
    })
    expect(describeDurableRun).not.toHaveBeenCalled()
  })

  it('recovers workflow observation from Temporal when available', async () => {
    const describeDurableRun = vi.fn(async () => ({
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      temporalRunId: 'temporal_run_1',
      status: 'WORKFLOW_EXECUTION_STATUS_RUNNING',
    }))
    const { service, temporalWorkflowRepository } = createService({
      enabled: true,
      temporalRunClient: {
        startDurableRun: vi.fn(),
        describeDurableRun,
      },
    })
    await temporalWorkflowRepository.saveStartedWorkflow({
      runId: 'run_temporal_start_1',
      workspaceId: 'workspace_1',
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      temporalRunId: 'temporal_run_1',
      taskQueue: 'ai-war-room-runs',
      status: 'unknown',
      startedAt: now,
    })

    await expect(
      service.recoverWorkflowObservation({
        workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
        authContext,
      }),
    ).resolves.toMatchObject({
      syncedFromTemporal: true,
      workflow: {
        status: 'running',
      },
      recoveryHint: expect.stringContaining('still running'),
    })
  })

  it('returns persisted workflow metadata when Temporal recovery sync fails', async () => {
    const describeDurableRun = vi.fn(async () => {
      throw new Error('Temporal server unavailable')
    })
    const { service, temporalWorkflowRepository } = createService({
      enabled: true,
      temporalRunClient: {
        startDurableRun: vi.fn(),
        describeDurableRun,
      },
    })
    await temporalWorkflowRepository.saveStartedWorkflow({
      runId: 'run_temporal_start_1',
      workspaceId: 'workspace_1',
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      temporalRunId: 'temporal_run_1',
      taskQueue: 'ai-war-room-runs',
      status: 'running',
      startedAt: now,
    })

    await expect(
      service.recoverWorkflowObservation({
        workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
        authContext,
      }),
    ).resolves.toMatchObject({
      syncedFromTemporal: false,
      workflow: {
        status: 'running',
      },
      recoveryHint: expect.stringContaining('persisted'),
    })
  })

  it('looks up workflow metadata by run id', async () => {
    const { service, temporalWorkflowRepository } = createService({
      enabled: true,
      temporalRunClient: {
        startDurableRun: vi.fn(),
        describeDurableRun: vi.fn(),
      },
    })
    await temporalWorkflowRepository.saveStartedWorkflow({
      runId: 'run_temporal_start_1',
      workspaceId: 'workspace_1',
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      temporalRunId: 'temporal_run_1',
      taskQueue: 'ai-war-room-runs',
      status: 'running',
      startedAt: now,
    })

    await expect(
      service.getWorkflowByRunId({
        runId: 'run_temporal_start_1',
        authContext,
      }),
    ).resolves.toMatchObject({
      workflow: {
        workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
        status: 'running',
      },
    })
  })

  it('preserves not-found errors from workflow status checks', async () => {
    const { service } = createService({
      enabled: true,
      temporalRunClient: {
        startDurableRun: vi.fn(),
        describeDurableRun: vi.fn(),
      },
    })

    await expect(
      service.getWorkflowStatus({
        workflowId: 'ai-war-room-workspace_1-run_missing',
        authContext,
      }),
    ).rejects.toMatchObject({
      status: 404,
    })
  })
})
