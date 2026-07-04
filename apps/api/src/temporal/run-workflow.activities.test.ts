import type { MockPipelineRequest, MockPipelineResult } from '@ai-war-room/schemas'
import { describe, expect, it, vi } from 'vitest'
import type { PipelineStreamEvent } from '../runs/pipeline-stream-event.js'
import { createRunWorkflowActivities } from './run-workflow.activities.js'

const now = '2026-01-01T00:00:00.000Z'

function createRequest(): MockPipelineRequest {
  const triage = {
    domain: 'saas' as const,
    subdomain: 'AI strategy',
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
    reasoningSummary: 'Run the core council before generating artifacts.',
  }

  return {
    draftRun: {
      runId: 'run_temporal_1',
      workspaceId: 'workspace_1',
      status: 'draft',
      idea: {
        rawIdea: 'Build an AI council for product planning.',
        strategicGoals: ['Create a durable workflow boundary'],
        technicalPreferences: ['Temporal worker skeleton'],
        constraints: ['Do not require a Temporal server in unit tests'],
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

function createResult(): MockPipelineResult {
  return {
    runId: 'run_temporal_1',
    workspaceId: 'workspace_1',
    status: 'completed',
    steps: [
      {
        stepId: 'agent_pool',
        label: 'Agent pool',
        status: 'completed',
        startedAt: now,
        completedAt: now,
      },
    ],
    agentOutputs: [
      {
        runId: 'run_temporal_1',
        agentRole: 'product_manager',
        output: {
          summary: 'The idea has a clear planning use case.',
          strengths: ['Focused workflow'],
          weaknesses: ['Needs orchestration later'],
          risks: ['Worker availability'],
          recommendations: ['Add Temporal integration behind a boundary'],
          roleSpecificInsights: {},
        },
        promptVersion: 'agent.product_manager.v1',
        modelProvider: 'mock',
        modelName: 'mock-json-v1',
        validationStatus: 'valid',
        inputTokens: 10,
        outputTokens: 20,
        estimatedCostUsd: 0,
        completedAt: now,
      },
    ],
    moderatorSynthesis: {
      executivePositioning: 'Durable AI council planning workflow.',
      targetUsers: ['Founders'],
      coreProblem: 'Synchronous runs are hard to recover after restarts.',
      proposedSolution: 'Execute approved runs through Temporal activities.',
      mvpScope: ['Workflow skeleton'],
      nonGoals: ['Full production orchestration'],
      keyDecisions: ['Keep REST/SSE flow unchanged in v4.0'],
      risks: ['Temporal server dependency in later milestones'],
      openQuestions: [],
      artifactGenerationBrief: {},
    },
    artifacts: [
      createArtifact('executive_summary', {
        productIdea: 'AI War Room',
        targetUsers: ['Founders'],
        coreValueProposition: 'Better product decisions',
        mainDifferentiator: 'Multi-agent council',
        mvpRecommendation: 'Start with durable run workflow',
        topRisks: ['Operational complexity'],
        recommendation: 'go' as const,
      }),
      createArtifact('prd', {
        overview: 'Durable workflow PRD',
        goals: ['Recover approved runs'],
        nonGoals: ['Replace all endpoints'],
        userPersonas: ['Founder'],
        userJourneys: ['Approve run then worker executes it'],
        functionalRequirements: ['Start workflow from approved request'],
        nonFunctionalRequirements: ['Idempotent activities'],
        mvpScope: ['Worker skeleton'],
        futureScope: ['Workflow status endpoint'],
        securityConsiderations: ['Preserve Shield checks'],
        successMetrics: ['Runs survive worker restart'],
        openQuestions: [],
      }),
      createArtifact('development_prompt', {
        productSummary: 'Add Temporal orchestration.',
        technicalStack: ['NestJS', 'Temporal'],
        architectureOverview: 'Worker executes existing pipeline as activity.',
        requiredModules: ['Temporal worker'],
        dataModel: ['Reuse run schemas'],
        apiRequirements: ['No new endpoint in skeleton'],
        uiRequirements: ['No UI change'],
        securityConstraints: ['No API keys in workflow history'],
        testingRequirements: ['Unit-test contracts'],
        implementationOrder: ['Add skeleton first'],
        outOfScope: ['Production deployment'],
      }),
    ],
    completedAt: now,
  }
}

function createArtifact(
  artifactType: 'executive_summary' | 'prd' | 'development_prompt',
  content: object,
) {
  return {
    metadata: {
      artifactId: `artifact_${artifactType}`,
      runId: 'run_temporal_1',
      workspaceId: 'workspace_1',
      artifactType,
      artifactVersion: '1',
      promptVersion: `artifact.${artifactType}.v1`,
      modelProvider: 'mock',
      modelName: 'mock-json-v1',
      tokenUsage: {
        inputTokens: 10,
        outputTokens: 20,
      },
      estimatedCostUsd: 0,
      validationStatus: 'valid' as const,
      shieldStatus: 'clear' as const,
      createdAt: now,
    },
    artifact: {
      artifactType,
      content,
    },
  }
}

function createActivities(input?: {
  executeMockPipelineStream?: ReturnType<typeof vi.fn>
  append?: ReturnType<typeof vi.fn>
}) {
  const append = input?.append ?? vi.fn(async (payload: { event: PipelineStreamEvent }) => payload.event)
  const executeMockPipelineStream =
    input?.executeMockPipelineStream ??
    vi.fn(async (_request: MockPipelineRequest, emit: (event: PipelineStreamEvent) => Promise<void>) => {
      await emit({
        eventId: 'event_status_1',
        type: 'status',
        stepId: 'agent_pool',
        label: 'Agent pool',
        status: 'running',
        timestamp: now,
      })

      return createResult()
    })

  const activities = createRunWorkflowActivities({
    runsService: {
      executeMockPipelineStream,
    },
    streamEventBufferService: {
      append,
    },
  })

  return {
    activities,
    append,
    executeMockPipelineStream,
  }
}

describe('run workflow activities', () => {
  it('validates durable workflow input with existing pipeline schemas', async () => {
    const { activities } = createActivities()

    await expect(
      activities.validateDurableRun({
        request: createRequest(),
        authContext: {
          userId: 'user_test',
          workspaceId: 'workspace_1',
          role: 'owner',
        },
        requestedAt: now,
      }),
    ).resolves.toMatchObject({
      request: {
        draftRun: {
          runId: 'run_temporal_1',
        },
      },
    })
  })

  it('rejects invalid workflow input before executing a pipeline activity', async () => {
    const { activities, executeMockPipelineStream } = createActivities()

    await expect(
      activities.validateDurableRun({
        requestedAt: now,
      }),
    ).rejects.toThrow()
    expect(executeMockPipelineStream).not.toHaveBeenCalled()
  })

  it('executes the approved run through the streaming RunsService boundary', async () => {
    const request = createRequest()
    const result = createResult()
    const { activities, executeMockPipelineStream } = createActivities({
      executeMockPipelineStream: vi.fn(async () => result),
    })

    await expect(
      activities.executeApprovedRun({
        request,
        authContext: {
          userId: 'user_test',
          workspaceId: 'workspace_1',
          role: 'owner',
        },
        requestedAt: now,
      }),
    ).resolves.toMatchObject({
      result: {
        runId: result.runId,
        status: 'completed',
      },
    })
    expect(executeMockPipelineStream).toHaveBeenCalledWith(
      request,
      expect.any(Function),
      {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
    )
  })

  it('buffers pipeline stream events while executing through Temporal activities', async () => {
    const request = createRequest()
    const { activities, append } = createActivities()

    await activities.executeApprovedRun({
      request,
      authContext: {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      requestedAt: now,
    })

    expect(append).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace_1',
        runId: 'run_temporal_1',
        event: expect.objectContaining({
          type: 'status',
          stepId: 'agent_pool',
        }),
      }),
    )
  })
})
