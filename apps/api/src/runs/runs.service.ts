import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import {
  type AgentExecutionResult,
  type AgentRole,
  type Artifact,
  type DraftRun,
  type MockPipelineResult,
  type ModeratorSynthesis,
  agentRoleSchema,
  artifactSchema,
  createRunRequestSchema,
  draftRunSchema,
  mockPipelineRequestSchema,
  mockPipelineResultSchema,
  moderatorSynthesisSchema,
  runStatusSchema,
} from '@ai-war-room/schemas'
import { AgentService } from '../agents/agent.service.js'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import {
  RUN_REPOSITORY,
  type RunRepository,
} from '../persistence/run.repository.js'
import { TriageService } from '../triage/triage.service.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

@Injectable()
export class RunsService {
  constructor(
    @Inject(RUN_REPOSITORY)
    private readonly runRepository: RunRepository,
    private readonly idempotencyService: IdempotencyService,
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly triageService: TriageService,
    private readonly agentService: AgentService,
  ) {}

  getCapabilities() {
    return {
      statuses: runStatusSchema.options,
      agentRoles: agentRoleSchema.options,
      flow: [
        'idea_submission',
        'shield_scan',
        'triage',
        'human_review',
        'agent_pool',
        'moderator',
        'artifacts',
      ],
    }
  }

  async createDraftRun(input: unknown): Promise<DraftRun> {
    const parsedRequest = createRunRequestSchema.safeParse(input)

    if (!parsedRequest.success) {
      throw new BadRequestException({
        message: 'Invalid create run request.',
        issues: parsedRequest.error.issues,
      })
    }

    const request = parsedRequest.data
    const existingRun =
      await this.runRepository.findDraftRunByIdempotencyKey(
        request.workspaceId,
        request.idempotencyKey,
      )

    if (existingRun) {
      return existingRun
    }

    const idempotencyTtlSeconds = this.configService.get(
      'IDEMPOTENCY_TTL_SECONDS',
      { infer: true },
    )
    const reserved = await this.idempotencyService.reserve({
      workspaceId: request.workspaceId,
      idempotencyKey: request.idempotencyKey,
      ttlSeconds: idempotencyTtlSeconds,
    })

    if (!reserved) {
      const maybeExisting =
        await this.runRepository.findDraftRunByIdempotencyKey(
          request.workspaceId,
          request.idempotencyKey,
        )

      if (maybeExisting) {
        return maybeExisting
      }

      throw new ConflictException({
        message: 'Duplicate run request is already being processed.',
      })
    }

    const shieldScan = this.triageService.scanInput(request.idea.rawIdea)
    const triage = await this.triageService.triageIdea(request, shieldScan)
    const now = new Date().toISOString()

    const draftRun = draftRunSchema.parse({
      runId: createId('run'),
      workspaceId: request.workspaceId,
      status: 'draft',
      idea: request.idea,
      shieldScan,
      triage,
      selectedAgents: triage.recommendedAgents,
      estimatedDurationSeconds: triage.estimatedDurationSeconds,
      estimatedMaxCostUsd: triage.estimatedMaxCostUsd,
      createdAt: now,
      updatedAt: now,
    })

    await this.runRepository.saveDraftRun({
      draftRun,
      idempotencyKey: request.idempotencyKey,
      idempotencyTtlSeconds,
    })

    return draftRun
  }

  async executeMockPipeline(input: unknown): Promise<MockPipelineResult> {
    const parsedRequest = mockPipelineRequestSchema.safeParse(input)

    if (!parsedRequest.success) {
      throw new BadRequestException({
        message: 'Invalid mock pipeline request.',
        issues: parsedRequest.error.issues,
      })
    }

    const request = parsedRequest.data
    const now = new Date().toISOString()
    const executableAgents = request.selectedAgents.filter(
      (agentRole): agentRole is Exclude<AgentRole, 'moderator'> =>
        agentRole !== 'moderator',
    )

    if (executableAgents.length === 0) {
      throw new BadRequestException({
        message: 'At least one non-moderator agent is required.',
      })
    }

    const agentOutputs = await Promise.all(
      executableAgents.map((agentRole) =>
        this.agentService.executeAgent({
          runId: request.draftRun.runId,
          agentRole,
          draftRun: request.draftRun,
          completedAt: now,
        }),
      ),
    )
    const moderatorSynthesis = this.createMockModeratorSynthesis(
      request.draftRun,
      request.approvedTriage,
      agentOutputs,
    )
    const artifacts = this.createMockArtifacts({
      draftRun: request.draftRun,
      moderatorSynthesis,
      completedAt: now,
    })

    const pipelineResult = mockPipelineResultSchema.parse({
      runId: request.draftRun.runId,
      workspaceId: request.draftRun.workspaceId,
      status: 'completed',
      steps: [
        this.createCompletedStep('shield_scan', 'Shield scan', now),
        this.createCompletedStep('triage', 'Triage', now),
        this.createCompletedStep('agent_pool', 'Mock agent pool', now),
        this.createCompletedStep('moderator', 'Moderator synthesis', now),
        this.createCompletedStep('artifacts', 'Artifact generation', now),
      ],
      agentOutputs,
      moderatorSynthesis,
      artifacts,
      completedAt: now,
    })

    await this.runRepository.saveMockPipelineResult(pipelineResult)

    return pipelineResult
  }

  private createMockModeratorSynthesis(
    draftRun: DraftRun,
    approvedTriage: DraftRun['triage'],
    agentOutputs: AgentExecutionResult[],
  ): ModeratorSynthesis {
    const synthesis = {
      executivePositioning:
        'AI War Room is a structured planning engine that converts raw product ideas into build-ready artifacts.',
      targetUsers: [
        draftRun.idea.targetAudience ?? 'Founders',
        'Indie hackers',
        'Technical product builders',
      ],
      coreProblem:
        'Builders lose time turning rough ideas into coherent specifications and implementation prompts.',
      proposedSolution:
        'Run a controlled council of isolated AI specialists, synthesize their findings, and generate consistent artifacts after human review.',
      mvpScope: [
        'Idea submission',
        'Shield input scan',
        'Human Review Screen',
        'Mock isolated agent analysis',
        'Moderator synthesis',
        'Executive Summary, PRD, and Development Prompt',
      ],
      nonGoals: [
        'Custom user-defined agents',
        'Agent marketplace',
        'Open-ended multi-agent chat',
      ],
      keyDecisions: [
        `Use ${approvedTriage.recommendedRunMode} run mode for this draft.`,
        `Execute ${agentOutputs.length} non-moderator agents in isolation.`,
        'Keep Shield as a background security layer.',
      ],
      risks: agentOutputs.flatMap((agentOutput) => agentOutput.output.risks).slice(0, 10),
      openQuestions: [
        'Which artifact format should users export first?',
        'What quality signal proves that a generated development prompt is build-ready?',
      ],
      artifactGenerationBrief: {
        source: 'mock_mvp_pipeline',
        agentCount: agentOutputs.length,
        shieldStatus: draftRun.shieldScan.status,
      },
    }

    return moderatorSynthesisSchema.parse(synthesis)
  }

  private createMockArtifacts(input: {
    draftRun: DraftRun
    moderatorSynthesis: ModeratorSynthesis
    completedAt: string
  }): Artifact[] {
    const metadataBase = {
      runId: input.draftRun.runId,
      workspaceId: input.draftRun.workspaceId,
      artifactVersion: 'v1',
      modelProvider: 'mock',
      modelName: 'deterministic-mvp-artifact-generator',
      tokenUsage: {
        inputTokens: 0,
        outputTokens: 0,
      },
      estimatedCostUsd: 0,
      validationStatus: 'valid' as const,
      shieldStatus: 'clear' as const,
      createdAt: input.completedAt,
    }

    return [
      artifactSchema.parse({
        metadata: {
          ...metadataBase,
          artifactId: createId('artifact'),
          artifactType: 'executive_summary',
          promptVersion: 'mock/executive_summary/v1',
        },
        artifact: {
          artifactType: 'executive_summary',
          content: {
            productIdea: input.draftRun.idea.rawIdea,
            targetUsers: input.moderatorSynthesis.targetUsers,
            coreValueProposition:
              'Generate validated product planning artifacts from a raw idea in minutes.',
            mainDifferentiator:
              'A structured non-chat pipeline with isolated agents and human approval.',
            mvpRecommendation:
              'Continue with the local mock pipeline, then add persistence before real LLM calls.',
            topRisks: input.moderatorSynthesis.risks.slice(0, 5),
            recommendation: 'go',
          },
        },
      }),
      artifactSchema.parse({
        metadata: {
          ...metadataBase,
          artifactId: createId('artifact'),
          artifactType: 'prd',
          promptVersion: 'mock/prd/v1',
        },
        artifact: {
          artifactType: 'prd',
          content: {
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
              'System executes mock agents and produces artifacts.',
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
              'Keep mock pipeline deterministic for MVP testing.',
            ],
            mvpScope: input.moderatorSynthesis.mvpScope,
            futureScope: [
              'Persistence',
              'Temporal orchestration',
              'Real LLM-backed agents',
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
          },
        },
      }),
      artifactSchema.parse({
        metadata: {
          ...metadataBase,
          artifactId: createId('artifact'),
          artifactType: 'development_prompt',
          promptVersion: 'mock/development_prompt/v1',
        },
        artifact: {
          artifactType: 'development_prompt',
          content: {
            productSummary: input.moderatorSynthesis.executivePositioning,
            technicalStack: ['Vite', 'React', 'TypeScript', 'NestJS', 'Fastify', 'Zod'],
            architectureOverview:
              'Use a monorepo with web, api, and shared schema packages. Keep the mock pipeline behind the API service until durable orchestration is introduced.',
            requiredModules: [
              'Idea submission UI',
              'Human Review Screen',
              'Runs API',
              'Mock agent pipeline',
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
            securityConstraints: [
              'Do not execute user-provided instructions as system instructions.',
              'Highlight risky user spans without exposing scanner internals.',
            ],
            testingRequirements: [
              'Validate mock pipeline response schema.',
              'Test Shield detection and agent routing.',
              'Run build, lint, typecheck, and tests before committing.',
            ],
            implementationOrder: [
              'Build draft run review flow.',
              'Build mock pipeline endpoint.',
              'Render artifacts.',
              'Add persistence in the next milestone.',
            ],
            outOfScope: ['Real LLM calls', 'Temporal orchestration', 'Billing'],
          },
        },
      }),
    ]
  }

  private createCompletedStep(stepId: string, label: string, timestamp: string) {
    return {
      stepId,
      label,
      status: 'completed',
      startedAt: timestamp,
      completedAt: timestamp,
    }
  }
}
