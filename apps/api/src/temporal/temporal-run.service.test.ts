import type { ConfigService } from '@nestjs/config'
import type { MockPipelineRequest } from '@ai-war-room/schemas'
import { describe, expect, it, vi } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import type { ObservabilityService } from '../observability/observability.service.js'
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
  return new TemporalRunService(
    createConfigService(input.enabled),
    createObservabilityService(),
    input.temporalRunClient,
  )
}

describe('TemporalRunService', () => {
  it('starts an approved run through the Temporal client adapter', async () => {
    const request = createRequest()
    const startDurableRun = vi.fn(async () => ({
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      temporalRunId: 'temporal_run_1',
    }))
    const service = createService({
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
  })

  it('maps Temporal workflow status into API status response', async () => {
    const describeDurableRun = vi.fn(async () => ({
      workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
      temporalRunId: 'temporal_run_1',
      status: 'WORKFLOW_EXECUTION_STATUS_COMPLETED',
    }))
    const service = createService({
      enabled: true,
      temporalRunClient: {
        startDurableRun: vi.fn(),
        describeDurableRun,
      },
    })

    await expect(
      service.getWorkflowStatus({
        workflowId: 'ai-war-room-workspace_1-run_temporal_start_1',
        authContext,
      }),
    ).resolves.toMatchObject({
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
  })

  it('keeps workflow start disabled until Temporal is explicitly enabled', async () => {
    const startDurableRun = vi.fn()
    const service = createService({
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
    const service = createService({
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
})
