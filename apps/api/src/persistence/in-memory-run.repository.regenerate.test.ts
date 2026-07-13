import { describe, expect, it } from 'vitest'
import { InMemoryRunRepository } from './in-memory-run.repository.js'
import type { MockPipelineResult } from '@ai-war-room/schemas'

const agentExtras = {
  ideaGaps: ['Missing journey detail'],
  additions: ['Add MVP checklist'],
  mustHaveFeatures: ['Primary create/read flow'],
  buildNotes: ['Start with schemas and screens'],
} as const

function sampleResult(
  overrides: Partial<MockPipelineResult> = {},
): MockPipelineResult {
  const completedAt = '2026-07-13T12:00:00.000Z'

  return {
    runId: 'run_1',
    workspaceId: 'workspace_1',
    status: 'completed',
    steps: [
      {
        stepId: 'agent_pool',
        label: 'Prompt-driven agent pool',
        status: 'completed',
        completedAt,
      },
    ],
    agentOutputs: [
      {
        runId: 'run_1',
        agentRole: 'product_manager',
        output: {
          summary: 'Original PM summary with enough depth for a product breakdown.',
          strengths: ['Clear scope'],
          weaknesses: ['Needs validation'],
          risks: ['Scope creep'],
          recommendations: ['Keep schemas strict'],
          ...agentExtras,
          roleSpecificInsights: {},
        },
        validationStatus: 'valid',
        promptVersion: 'agents/product_manager/v2',
        modelProvider: 'mock',
        modelName: 'mock-json-v1',
        inputTokens: 10,
        outputTokens: 20,
        estimatedCostUsd: 0.01,
        completedAt,
      },
      {
        runId: 'run_1',
        agentRole: 'critic',
        output: {
          summary: 'Original critic summary with gap analysis and additions.',
          strengths: ['Honest critique'],
          weaknesses: ['Mock depth'],
          risks: ['Overconfidence'],
          recommendations: ['Add evals'],
          ...agentExtras,
          roleSpecificInsights: {},
        },
        validationStatus: 'valid',
        promptVersion: 'agents/critic/v2',
        modelProvider: 'mock',
        modelName: 'mock-json-v1',
        inputTokens: 11,
        outputTokens: 21,
        estimatedCostUsd: 0.01,
        completedAt,
      },
    ],
    moderatorSynthesis: {
      executivePositioning: 'Positioning',
      targetUsers: ['Founders'],
      coreProblem: 'Problem',
      proposedSolution: 'Solution',
      mvpScope: ['MVP'],
      nonGoals: ['Chat'],
      keyDecisions: ['Decision'],
      risks: ['Risk'],
      openQuestions: ['Question'],
      additionsToIdea: ['Add screens and acceptance criteria'],
      mvpBuildSequence: ['Clarify gaps', 'PRD', 'Development Prompt', 'Build'],
      artifactGenerationBrief: {
        promptVersion: 'moderator/v2',
        validationStatus: 'valid',
        source: 'test',
      },
    },
    artifacts: [
      {
        metadata: {
          artifactId: 'artifact_exec',
          runId: 'run_1',
          workspaceId: 'workspace_1',
          artifactType: 'executive_summary',
          artifactVersion: 'v1',
          promptVersion: 'artifacts/executive_summary/v2',
          modelProvider: 'mock',
          modelName: 'mock-json-v1',
          validationStatus: 'valid',
          shieldStatus: 'clear',
          tokenUsage: { inputTokens: 1, outputTokens: 1 },
          estimatedCostUsd: 0,
          createdAt: completedAt,
        },
        artifact: {
          artifactType: 'executive_summary',
          content: {
            productIdea: 'Idea',
            targetUsers: ['Founders'],
            coreValueProposition: 'Value',
            mainDifferentiator: 'Diff',
            mvpRecommendation: 'MVP',
            topRisks: ['Risk'],
            recommendation: 'go',
          },
        },
      },
      {
        metadata: {
          artifactId: 'artifact_prd',
          runId: 'run_1',
          workspaceId: 'workspace_1',
          artifactType: 'prd',
          artifactVersion: 'v1',
          promptVersion: 'artifacts/prd/v2',
          modelProvider: 'mock',
          modelName: 'mock-json-v1',
          validationStatus: 'valid',
          shieldStatus: 'clear',
          tokenUsage: { inputTokens: 1, outputTokens: 1 },
          estimatedCostUsd: 0,
          createdAt: completedAt,
        },
        artifact: {
          artifactType: 'prd',
          content: {
            overview: 'Overview',
            goals: ['Goal'],
            nonGoals: ['Non-goal'],
            userPersonas: ['Founder'],
            userJourneys: ['Journey'],
            functionalRequirements: ['Req'],
            nonFunctionalRequirements: ['NFR'],
            successMetrics: ['Metric'],
            mvpScope: ['Scope'],
            futureScope: ['Later'],
            securityConsiderations: ['Secure'],
            openQuestions: ['Q'],
            screensOrViews: ['Home'],
            userStories: ['As a founder, I want a plan.'],
            acceptanceCriteria: ['PRD validates'],
          },
        },
      },
      {
        metadata: {
          artifactId: 'artifact_dev',
          runId: 'run_1',
          workspaceId: 'workspace_1',
          artifactType: 'development_prompt',
          artifactVersion: 'v1',
          promptVersion: 'artifacts/development_prompt/v2',
          modelProvider: 'mock',
          modelName: 'mock-json-v1',
          validationStatus: 'valid',
          shieldStatus: 'clear',
          tokenUsage: { inputTokens: 1, outputTokens: 1 },
          estimatedCostUsd: 0,
          createdAt: completedAt,
        },
        artifact: {
          artifactType: 'development_prompt',
          content: {
            targetTool: 'cursor',
            productSummary: 'Build the approved product.',
            technicalStack: ['TypeScript'],
            architectureOverview: 'Monorepo web + api.',
            requiredModules: ['Module'],
            dataModel: ['Model'],
            apiRequirements: ['API'],
            uiRequirements: ['UI'],
            securityConstraints: ['Secure'],
            testingRequirements: ['Test'],
            implementationOrder: ['First'],
            outOfScope: ['Chat'],
            toolSpecificGuidance: ['Use Cursor'],
            buildTodos: [
              {
                title: 'Scaffold app',
                details: 'Create the web shell.',
                acceptanceCheck: 'App boots',
                suggestedFiles: ['apps/web/src/App.tsx'],
              },
            ],
            screenMap: ['Home'],
            copyPasteBrief: 'Build the approved MVP web app using the PRD.',
          },
        },
      },
    ],
    completedAt,
    ...overrides,
  }
}

describe('InMemoryRunRepository regenerate persistence', () => {
  it('stores, finds, and replaces completed pipeline results', async () => {
    const repository = new InMemoryRunRepository()
    const original = sampleResult()

    await repository.saveMockPipelineResult(original)

    const found = await repository.findCompletedPipelineResult(
      'workspace_1',
      'run_1',
    )
    expect(found?.agentOutputs[0]?.output.summary).toBe(
      'Original PM summary with enough depth for a product breakdown.',
    )

    const replaced = sampleResult({
      completedAt: '2026-07-13T13:00:00.000Z',
      agentOutputs: [
        {
          ...original.agentOutputs[0]!,
          output: {
            ...original.agentOutputs[0]!.output,
            summary: 'Regenerated PM summary',
          },
          completedAt: '2026-07-13T13:00:00.000Z',
        },
        original.agentOutputs[1]!,
      ],
    })

    await repository.replaceCompletedPipelineResult(replaced)

    const after = await repository.findCompletedPipelineResult(
      'workspace_1',
      'run_1',
    )
    expect(after?.agentOutputs[0]?.output.summary).toBe('Regenerated PM summary')
    expect(after?.agentOutputs[1]?.output.summary).toBe(
      'Original critic summary with gap analysis and additions.',
    )
    expect(
      await repository.findCompletedPipelineResult('workspace_other', 'run_1'),
    ).toBeNull()
  })
})
