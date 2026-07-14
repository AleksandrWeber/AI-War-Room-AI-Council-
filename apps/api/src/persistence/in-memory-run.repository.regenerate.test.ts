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
    status: 'awaiting_idea_approval',
    steps: [
      {
        stepId: 'agent_pool',
        label: 'Prompt-driven agent pool',
        status: 'completed',
        completedAt,
      },
      {
        stepId: 'idea_brief',
        label: 'Expanded idea brief',
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
      mvpBuildSequence: ['Clarify gaps', 'Idea brief', 'Master prompt', 'Todo list'],
      artifactGenerationBrief: {
        promptVersion: 'moderator/v2',
        validationStatus: 'valid',
        source: 'test',
      },
    },
    artifacts: [
      {
        metadata: {
          artifactId: 'artifact_idea',
          runId: 'run_1',
          workspaceId: 'workspace_1',
          artifactType: 'idea_brief',
          artifactVersion: 'v1',
          promptVersion: 'artifacts/idea_brief/v1',
          modelProvider: 'mock',
          modelName: 'mock-json-v1',
          validationStatus: 'valid',
          shieldStatus: 'clear',
          tokenUsage: { inputTokens: 1, outputTokens: 1 },
          estimatedCostUsd: 0,
          createdAt: completedAt,
        },
        artifact: {
          artifactType: 'idea_brief',
          content: {
            summaryForUser: 'Expanded idea for discussion.',
            expandedIdea: 'Build a structured product planning web app.',
            analysis: 'Keep MVP scope; clarify tools and AI roles before build.',
            acceptRecommendations: ['Keep human review'],
            applyRecommendations: ['Add screen inventory'],
            toolsToUse: [
              { name: 'Vite + React', why: 'Fast UI', required: true },
            ],
            aiChoices: [
              {
                name: 'Cursor',
                role: 'Implementation',
                why: 'File-scoped coding',
              },
            ],
            openQuestions: ['Confirm auth provider'],
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
