import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import {
  type Artifact,
  type DevelopmentPrompt,
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
import { artifactPrompts } from '../prompts/artifact.prompts.js'

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
  }): Promise<Artifact[]> {
    const executiveSummary = await this.generateExecutiveSummary(input)
    const prd = await this.generatePrd(input)
    const developmentPrompt = await this.generateDevelopmentPrompt({
      ...input,
      completedPrd: prd.artifact.content,
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
  }): Promise<Artifact & { artifact: { artifactType: 'development_prompt' } }> {
    const prompt = artifactPrompts.development_prompt
    const fallback = this.createFallbackDevelopmentPrompt(input)
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: prompt.version,
      schema: developmentPromptSchema,
      messages: this.createMessages(prompt.system, prompt.userTemplate, input),
      fallback,
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
        content: result.value,
      }),
      artifact: {
        artifactType: 'development_prompt',
        content: result.value,
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
      productIdea: input.draftRun.idea.rawIdea,
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
    }
  }

  private createFallbackDevelopmentPrompt(input: {
    completedPrd: Prd
    moderatorSynthesis: ModeratorSynthesis
  }): DevelopmentPrompt {
    return {
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
    }
  }
}
