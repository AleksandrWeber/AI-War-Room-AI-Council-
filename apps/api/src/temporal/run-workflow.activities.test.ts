import type { MockPipelineRequest, MockPipelineResult } from '@ai-war-room/schemas'
import { describe, expect, it, vi } from 'vitest'
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
        validationStatus: 'valid',
        promptVersion: 'agent.product_manager.v1',
        modelProvider: 'mock',
        modelName: 'mock-json-v1',
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

function createArtifact(artifactType: 'executive_summary' | 'prd' | 'development_prompt', content: object) {
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

describe('run workflow activities', () => {
  it('validates durable workflow input with existing pipeline schemas', async () => {
    const activities = createRunWorkflowActivities({
      executeMockPipeline: vi.fn(),
    })
    const request = createRequest()

    await expect(
      activities.validateDurableRun({
        request,
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
          runId: request.draftRun.runId,
        },
      },
    })
  })

  it('rejects invalid workflow input before executing a pipeline activity', async () => {
    const executeMockPipeline = vi.fn()
    const activities = createRunWorkflowActivities({
      executeMockPipeline,
    })

    await expect(
      activities.validateDurableRun({
        requestedAt: now,
      }),
    ).rejects.toThrow()
    expect(executeMockPipeline).not.toHaveBeenCalled()
  })

  it('executes the approved run through the existing RunsService boundary', async () => {
    const request = createRequest()
    const result = createResult()
    const executeMockPipeline = vi.fn(async () => result)
    const activities = createRunWorkflowActivities({
      executeMockPipeline,
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
    expect(executeMockPipeline).toHaveBeenCalledWith(request, {
      userId: 'user_test',
      workspaceId: 'workspace_1',
      role: 'owner',
    })
  })
})
