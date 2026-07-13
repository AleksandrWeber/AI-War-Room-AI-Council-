import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import {
  type Artifact,
  type DevelopmentPrompt,
  type DevelopmentPromptTargetTool,
  type DraftRun,
  type ExecutiveSummary,
  type ModeratorSynthesis,
  type Prd,
  artifactSchema,
  developmentPromptSchema,
  executiveSummarySchema,
  prdSchema,
} from '@ai-war-room/schemas'
import { LlmGatewayService } from '../llm/llm-gateway.service.js'
import { truncateText } from '../llm/llm.utils.js'
import { artifactPrompts } from '../prompts/artifact.prompts.js'
import {
  getDevelopmentPromptSystemAddon,
  getDevelopmentPromptToolGuidance,
} from './development-prompt-targets.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

@Injectable()
export class ArtifactService {
  constructor(private readonly llmGatewayService: LlmGatewayService) {}

  async generateArtifacts(input: {
    draftRun: DraftRun
    moderatorSynthesis: ModeratorSynthesis
    completedAt: string
    developmentPromptTargetTool?: DevelopmentPromptTargetTool
  }): Promise<Artifact[]> {
    const executiveSummary = await this.generateExecutiveSummary(input)
    const prd = await this.generatePrd(input)
    const developmentPrompt = await this.generateDevelopmentPrompt({
      ...input,
      completedPrd: prd.artifact.content,
      targetTool: input.developmentPromptTargetTool ?? 'cursor',
    })

    return [executiveSummary, prd, developmentPrompt]
  }

  private async generateExecutiveSummary(input: {
    draftRun: DraftRun
    moderatorSynthesis: ModeratorSynthesis
    completedAt: string
  }): Promise<Artifact & { artifact: { artifactType: 'executive_summary' } }> {
    const prompt = artifactPrompts.executive_summary
    const fallback = this.createFallbackExecutiveSummary(input)
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: prompt.version,
      schema: executiveSummarySchema,
      workspaceId: input.draftRun.workspaceId,
      messages: this.createMessages(prompt.system, prompt.userTemplate, input),
      fallback,
    })

    return artifactSchema.parse({
      metadata: this.createMetadata({
        input,
        artifactType: 'executive_summary',
        promptVersion: prompt.version,
        providerId: result.providerId,
        model: result.model,
        validationStatus: result.validationStatus,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        estimatedCostUsd: result.usage.estimatedCostUsd,
        content: result.value,
      }),
      artifact: {
        artifactType: 'executive_summary',
        content: result.value,
      },
    }) as Artifact & { artifact: { artifactType: 'executive_summary' } }
  }

  private async generatePrd(input: {
    draftRun: DraftRun
    moderatorSynthesis: ModeratorSynthesis
    completedAt: string
  }): Promise<Artifact & { artifact: { artifactType: 'prd'; content: Prd } }> {
    const prompt = artifactPrompts.prd
    const fallback = this.createFallbackPrd(input)
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: prompt.version,
      schema: prdSchema,
      workspaceId: input.draftRun.workspaceId,
      messages: this.createMessages(prompt.system, prompt.userTemplate, input),
      fallback,
    })

    return artifactSchema.parse({
      metadata: this.createMetadata({
        input,
        artifactType: 'prd',
        promptVersion: prompt.version,
        providerId: result.providerId,
        model: result.model,
        validationStatus: result.validationStatus,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        estimatedCostUsd: result.usage.estimatedCostUsd,
        content: result.value,
      }),
      artifact: {
        artifactType: 'prd',
        content: result.value,
      },
    }) as Artifact & { artifact: { artifactType: 'prd'; content: Prd } }
  }

  private async generateDevelopmentPrompt(input: {
    draftRun: DraftRun
    moderatorSynthesis: ModeratorSynthesis
    completedAt: string
    completedPrd: Prd
    targetTool: DevelopmentPromptTargetTool
  }): Promise<Artifact & { artifact: { artifactType: 'development_prompt' } }> {
    const prompt = artifactPrompts.development_prompt
    const toolSpecificGuidance = getDevelopmentPromptToolGuidance(input.targetTool)
    const fallback = this.createFallbackDevelopmentPrompt({
      ...input,
      toolSpecificGuidance,
    })
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: prompt.version,
      schema: developmentPromptSchema,
      workspaceId: input.draftRun.workspaceId,
      messages: this.createMessages(
        `${prompt.system}\n${getDevelopmentPromptSystemAddon(input.targetTool)}`,
        prompt.userTemplate,
        {
          draftRun: input.draftRun,
          moderatorSynthesis: input.moderatorSynthesis,
          completedPrd: input.completedPrd,
          targetTool: input.targetTool,
          toolSpecificGuidance,
        },
      ),
      fallback,
    })
    const content = developmentPromptSchema.parse({
      ...result.value,
      targetTool: input.targetTool,
      toolSpecificGuidance:
        result.value.toolSpecificGuidance.length > 0
          ? result.value.toolSpecificGuidance
          : toolSpecificGuidance,
    })

    return artifactSchema.parse({
      metadata: this.createMetadata({
        input,
        artifactType: 'development_prompt',
        promptVersion: prompt.version,
        providerId: result.providerId,
        model: result.model,
        validationStatus: result.validationStatus,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        estimatedCostUsd: result.usage.estimatedCostUsd,
        content,
      }),
      artifact: {
        artifactType: 'development_prompt',
        content,
      },
    }) as Artifact & { artifact: { artifactType: 'development_prompt' } }
  }

  private createMessages(system: string, userTemplate: string, input: unknown) {
    return [
      {
        role: 'system' as const,
        content: system,
      },
      {
        role: 'user' as const,
        content: `${userTemplate}${JSON.stringify(input)}`,
      },
    ]
  }

  private createMetadata(input: {
    input: {
      draftRun: DraftRun
      completedAt: string
    }
    artifactType: Artifact['metadata']['artifactType']
    promptVersion: string
    providerId: string
    model: string
    validationStatus: Artifact['metadata']['validationStatus']
    inputTokens: number
    outputTokens: number
    estimatedCostUsd: number
    content: unknown
  }): Artifact['metadata'] {
    return {
      artifactId: createId('artifact'),
      runId: input.input.draftRun.runId,
      workspaceId: input.input.draftRun.workspaceId,
      artifactType: input.artifactType,
      artifactVersion: 'v1',
      promptVersion: input.promptVersion,
      modelProvider: input.providerId,
      modelName: input.model,
      tokenUsage: {
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
      },
      estimatedCostUsd: input.estimatedCostUsd,
      validationStatus: input.validationStatus,
      shieldStatus: this.scanArtifactContent(input.content),
      createdAt: input.input.completedAt,
    }
  }

  private scanArtifactContent(content: unknown): Artifact['metadata']['shieldStatus'] {
    const text = JSON.stringify(content).toLowerCase()

    return /ignore (all )?(previous|prior) instructions|system prompt|developer message|sk-[a-z0-9_-]{12,}|api[_-]?key|secret|password|token/.test(
      text,
    )
      ? 'warning'
      : 'clear'
  }

  private createFallbackExecutiveSummary(input: {
    draftRun: DraftRun
    moderatorSynthesis: ModeratorSynthesis
  }): ExecutiveSummary {
    return {
      productIdea: truncateText(input.draftRun.idea.rawIdea, 2_000),
      targetUsers: input.moderatorSynthesis.targetUsers,
      coreValueProposition: input.moderatorSynthesis.proposedSolution,
      mainDifferentiator:
        'A structured non-chat pipeline with isolated agents and human approval.',
      mvpRecommendation:
        'Continue with the prompt-driven local flow and validate artifact usefulness before adding orchestration complexity.',
      topRisks: input.moderatorSynthesis.risks.slice(0, 5),
      recommendation: 'go',
    }
  }

  private createFallbackPrd(input: {
    draftRun: DraftRun
    moderatorSynthesis: ModeratorSynthesis
  }): Prd {
    return {
      overview: input.moderatorSynthesis.proposedSolution,
      goals: [
        'Create a repeatable idea-to-artifacts workflow.',
        'Keep execution structured and schema-validated.',
        'Protect the pipeline with Shield checks.',
      ],
      nonGoals: input.moderatorSynthesis.nonGoals,
      userPersonas: input.moderatorSynthesis.targetUsers,
      userJourneys: [
        'User submits a raw idea and target audience.',
        'System scans input and triages the draft.',
        'User reviews metadata and selected agents.',
        'System executes prompt-driven agents and produces artifacts.',
      ],
      functionalRequirements: [
        'Submit idea draft.',
        'Display Shield findings with highlighted spans.',
        'Allow triage metadata edits.',
        'Allow selected agent edits.',
        'Generate Executive Summary, PRD, and Development Prompt.',
      ],
      nonFunctionalRequirements: [
        'Validate all generated objects with shared schemas.',
        'Record prompt version and model metadata for generated outputs.',
      ],
      mvpScope: input.moderatorSynthesis.mvpScope,
      futureScope: [
        'Temporal orchestration',
        'Real provider adapters',
        'SSE artifact streaming',
      ],
      securityConsiderations: [
        'Treat user input as untrusted.',
        'Keep Shield findings separate from general product reasoning.',
      ],
      successMetrics: [
        'Draft run completion rate.',
        'Artifact copy/export rate.',
        'User approval rate after Human Review.',
      ],
      openQuestions: input.moderatorSynthesis.openQuestions,
      screensOrViews: [
        'Idea submission screen',
        'Human review screen',
        'Pipeline progress view',
        'Artifact viewer with Development Prompt copy action',
      ],
      userStories: [
        'As a founder, I want to submit a product idea so that I can get a structured plan.',
        'As a builder, I want a detailed development prompt so that I can implement a web app in Cursor.',
        'As a reviewer, I want agent gaps and additions so that I know what to improve in the idea.',
      ],
      acceptanceCriteria: [
        'PRD includes screens, user stories, and acceptance criteria.',
        'Development Prompt includes buildTodos and a copyPasteBrief.',
        'Pipeline validates all artifacts against shared schemas.',
      ],
    }
  }

  private createFallbackDevelopmentPrompt(input: {
    completedPrd: Prd
    moderatorSynthesis: ModeratorSynthesis
    targetTool: DevelopmentPromptTargetTool
    toolSpecificGuidance: string[]
  }): DevelopmentPrompt {
    const buildTodos = [
      {
        title: 'Scaffold the web app shell',
        details:
          'Create the Vite + React + TypeScript app shell with routing and a primary layout for the product idea screens.',
        acceptanceCheck: 'App boots locally and shows an empty home route.',
        suggestedFiles: ['apps/web/src/App.tsx', 'apps/web/src/main.tsx'],
      },
      {
        title: 'Model core entities',
        details:
          'Define TypeScript types/Zod schemas for the main entities described in the PRD data model.',
        acceptanceCheck: 'Schemas parse fixture objects for the primary entities.',
        suggestedFiles: ['packages/schemas/src'],
      },
      {
        title: 'Implement primary screens',
        details:
          'Build the screens listed in screenMap with the functional requirements from the PRD.',
        acceptanceCheck: 'Each screenOrViews item is reachable in the UI.',
        suggestedFiles: ['apps/web/src'],
      },
      {
        title: 'Wire API endpoints',
        details:
          'Implement the API requirements needed for the MVP journeys and validate responses with shared schemas.',
        acceptanceCheck: 'Core endpoints return schema-valid JSON in local smoke checks.',
        suggestedFiles: ['apps/api/src'],
      },
      {
        title: 'Add acceptance tests',
        details:
          'Cover the happy-path user journey and schema validation gates listed in testingRequirements.',
        acceptanceCheck: 'Targeted tests pass locally.',
        suggestedFiles: ['apps/api/src', 'apps/web/src'],
      },
    ]

    return {
      targetTool: input.targetTool,
      productSummary: input.completedPrd.overview,
      technicalStack: ['Vite', 'React', 'TypeScript', 'NestJS', 'Fastify', 'Zod'],
      architectureOverview:
        'Use a monorepo with web, api, and shared schema packages. Keep generation behind API services and route all model calls through the LLM gateway.',
      requiredModules: [
        'Idea submission UI',
        'Human Review Screen',
        'Runs API',
        'Prompt-driven agent pipeline',
        'Artifact viewer',
      ],
      dataModel: [
        'DraftRun',
        'AgentExecutionResult',
        'ModeratorSynthesis',
        'Artifact',
      ],
      apiRequirements: [
        'POST /api/runs/draft',
        'POST /api/runs/mock-pipeline',
        'GET /api/runs/capabilities',
      ],
      uiRequirements: [
        'Show agent step statuses.',
        'Render generated artifacts after execution.',
        'Keep Shield warnings compact and contextual.',
        'Expose copy action for Development Prompt copyPasteBrief.',
      ],
      securityConstraints: input.completedPrd.securityConsiderations,
      testingRequirements: [
        'Validate prompt-driven pipeline response schema.',
        'Test Shield detection and agent routing.',
        'Run build, lint, typecheck, and tests before committing.',
      ],
      implementationOrder: [
        ...input.completedPrd.functionalRequirements.slice(0, 5),
        'Verify generated artifacts with schema tests and runtime checks.',
      ],
      outOfScope: input.completedPrd.nonGoals,
      toolSpecificGuidance: input.toolSpecificGuidance,
      buildTodos,
      screenMap:
        input.completedPrd.screensOrViews.length > 0
          ? input.completedPrd.screensOrViews
          : [
              'Idea submission',
              'Human review',
              'Pipeline progress',
              'Artifact viewer',
            ],
      copyPasteBrief: [
        `Build the product described in this PRD overview: ${input.completedPrd.overview}`,
        `Target users: ${input.completedPrd.userPersonas.join(', ')}`,
        `MVP scope: ${input.completedPrd.mvpScope.join('; ')}`,
        `Screens: ${input.completedPrd.screensOrViews.join('; ') || 'Define from MVP scope'}`,
        'Implement using Vite, React, TypeScript, NestJS, Fastify, and Zod.',
        'Work through buildTodos one by one with acceptance checks after each todo.',
        `Additions from moderator: ${(input.moderatorSynthesis.additionsToIdea ?? []).join('; ')}`,
      ].join('\n\n'),
    }
  }
}
