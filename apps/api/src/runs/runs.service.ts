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
  type AgentOutput,
  type AgentRole,
  type Artifact,
  type CreateRunRequest,
  type DraftRun,
  type MockPipelineResult,
  type ModeratorSynthesis,
  agentRoleSchema,
  agentExecutionResultSchema,
  artifactSchema,
  createRunRequestSchema,
  draftRunSchema,
  mockPipelineRequestSchema,
  mockPipelineResultSchema,
  moderatorSynthesisSchema,
  runStatusSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import {
  RUN_REPOSITORY,
  type RunRepository,
} from '../persistence/run.repository.js'

const promptInjectionPattern =
  /ignore (all )?(previous|prior) instructions|system prompt|developer message/i

const secretPattern =
  /(sk-[a-z0-9_-]{12,}|api[_-]?key|secret|password|token)/i

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

    const shieldScan = this.scanInput(request.idea.rawIdea)
    const triage = this.triageIdea(request, shieldScan.maxSeverity)
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
      (agentRole) => agentRole !== 'moderator',
    )

    if (executableAgents.length === 0) {
      throw new BadRequestException({
        message: 'At least one non-moderator agent is required.',
      })
    }

    const agentOutputs = executableAgents.map((agentRole) =>
      this.createMockAgentExecution({
        runId: request.draftRun.runId,
        agentRole,
        draftRun: request.draftRun,
        completedAt: now,
      }),
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

  private scanInput(rawIdea: string): DraftRun['shieldScan'] {
    const findings: DraftRun['shieldScan']['findings'] = []
    const injectionMatch = promptInjectionPattern.exec(rawIdea)
    const secretMatch = secretPattern.exec(rawIdea)

    if (injectionMatch) {
      findings.push({
        findingId: createId('finding'),
        severity: 'high',
        category: 'prompt_injection',
        source: 'user_input',
        span: {
          start: injectionMatch.index,
          end: injectionMatch.index + injectionMatch[0].length,
          quote: injectionMatch[0],
        },
        explanation:
          'The input appears to contain instructions that could override the planning pipeline.',
        recommendedAction: 'require_confirmation',
      })
    }

    if (secretMatch) {
      findings.push({
        findingId: createId('finding'),
        severity: 'medium',
        category: 'secrets',
        source: 'user_input',
        span: {
          start: secretMatch.index,
          end: secretMatch.index + secretMatch[0].length,
          quote: secretMatch[0],
        },
        explanation:
          'The input may contain a secret or credential-like value and should be reviewed.',
        recommendedAction: 'warn',
      })
    }

    const maxSeverity = findings.some((finding) => finding.severity === 'high')
      ? 'high'
      : findings.length > 0
        ? 'medium'
        : 'none'

    return {
      scanId: createId('scan'),
      status: findings.length > 0 ? 'warning' : 'clear',
      maxSeverity,
      findings,
    }
  }

  private triageIdea(
    request: CreateRunRequest,
    maxShieldSeverity: DraftRun['shieldScan']['maxSeverity'],
  ): DraftRun['triage'] {
    const text = [
      request.idea.rawIdea,
      request.idea.targetAudience ?? '',
      ...request.idea.strategicGoals,
      ...request.idea.technicalPreferences,
      ...request.idea.constraints,
    ]
      .join(' ')
      .toLowerCase()

    const securitySensitive =
      maxShieldSeverity === 'high' ||
      /security|appsec|auth|payment|fintech|compliance|privacy/.test(text)

    const mobileDomain = /mobile|ios|android|react native/.test(text)
    const complexity = /enterprise|multi-tenant|temporal|orchestrator|scale/.test(
      text,
    )
      ? 'high'
      : text.length > 600
        ? 'medium'
        : 'low'

    const recommendedAgents: DraftRun['selectedAgents'] = [
      'product_manager',
      'critic',
      'moderator',
    ]

    if (securitySensitive) {
      recommendedAgents.push('security_expert')
    }

    if (complexity === 'high') {
      recommendedAgents.push('software_architect')
    }

    if (/market|competitor|pricing|gtm|go-to-market/.test(text)) {
      recommendedAgents.push('market_researcher')
    }

    if (mobileDomain) {
      recommendedAgents.push('mobile_ux_expert')
    }

    const uniqueAgents = [...new Set(recommendedAgents)].slice(0, 7)

    return {
      domain: mobileDomain ? 'mobile' : securitySensitive ? 'security' : 'software',
      subdomain: securitySensitive ? 'Security-sensitive software' : 'SaaS planning',
      complexity,
      marketConfidence: /new market|unknown|validate|competitor/.test(text)
        ? 'low'
        : 'medium',
      securitySensitivity: securitySensitive ? 'high' : 'medium',
      recommendedRunMode: uniqueAgents.length > 4 ? 'deep' : 'standard',
      recommendedAgents: uniqueAgents,
      estimatedDurationSeconds: uniqueAgents.length > 4 ? 150 : 60,
      estimatedMaxCostUsd: uniqueAgents.length > 4 ? 1.25 : 0.5,
      reasoningSummary:
        'Deterministic MVP triage based on keywords, input length, and Shield findings.',
    }
  }

  private createMockAgentExecution(input: {
    runId: string
    agentRole: Exclude<AgentRole, 'moderator'>
    draftRun: DraftRun
    completedAt: string
  }): AgentExecutionResult {
    const output = this.createMockAgentOutput(input.agentRole, input.draftRun)

    return agentExecutionResultSchema.parse({
      runId: input.runId,
      agentRole: input.agentRole,
      output,
      validationStatus: 'valid',
      promptVersion: `mock/${input.agentRole}/v1`,
      modelProvider: 'mock',
      modelName: 'deterministic-mvp-agent',
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      shieldScan: {
        scanId: createId('scan'),
        status: 'clear',
        maxSeverity: 'none',
        findings: [],
      },
      completedAt: input.completedAt,
    })
  }

  private createMockAgentOutput(
    agentRole: Exclude<AgentRole, 'moderator'>,
    draftRun: DraftRun,
  ): AgentOutput {
    const idea = draftRun.idea.rawIdea
    const targetAudience = draftRun.idea.targetAudience ?? 'early adopters'

    const roleOutputs: Record<Exclude<AgentRole, 'moderator'>, AgentOutput> = {
      product_manager: {
        summary: `The product should focus on turning "${idea}" into a guided planning workflow for ${targetAudience}.`,
        strengths: [
          'Clear non-chat positioning.',
          'High-value output: PRD and development prompt.',
          'Human review before expensive execution reduces cost risk.',
        ],
        weaknesses: [
          'The MVP must avoid becoming a broad agent marketplace.',
          'Artifact quality depends on strong schemas and review UX.',
        ],
        risks: ['Scope creep across SaaS, security, billing, and orchestration.'],
        recommendations: [
          'Keep MVP focused on one standard run path.',
          'Make review metadata easy to edit before execution.',
        ],
        roleSpecificInsights: {
          targetAudience,
          positioning: 'Structured product planning engine',
        },
      },
      critic: {
        summary:
          'The idea is promising, but the main risk is overbuilding infrastructure before validating artifact usefulness.',
        strengths: [
          'Strong differentiation from chat-first tools.',
          'Explicit human approval creates a trust checkpoint.',
        ],
        weaknesses: [
          'Too many advanced SaaS concerns can delay learning.',
          'Mock outputs must not be mistaken for real validation.',
        ],
        risks: [
          'Users may expect market validation that requires external research.',
          'Generated artifacts may look complete while hiding unresolved assumptions.',
        ],
        recommendations: [
          'Expose open questions directly in artifacts.',
          'Measure whether users actually build from the generated prompt.',
        ],
        roleSpecificInsights: {
          challenge: 'Validate usefulness before scale complexity.',
        },
      },
      security_expert: {
        summary:
          'Security should remain a background guardrail through Shield, with explicit escalation only for meaningful findings.',
        strengths: [
          'Shield is separated from council reasoning.',
          'Risky spans can be shown without distracting from the main workflow.',
        ],
        weaknesses: [
          'False positives could interrupt product planning.',
          'Raw security scanner output must not leak into agent prompts.',
        ],
        risks: [
          'Prompt injection attempts in user input.',
          'Sensitive secrets pasted into planning forms.',
        ],
        recommendations: [
          'Keep low-risk Shield findings quiet.',
          'Pass only sanitized security summaries to downstream agents.',
        ],
        roleSpecificInsights: {
          shieldStatus: draftRun.shieldScan.status,
          findingCount: draftRun.shieldScan.findings.length,
        },
      },
      software_architect: {
        summary:
          'The architecture should preserve clear boundaries between UI, API, schemas, orchestration, and future workers.',
        strengths: [
          'Shared schemas reduce frontend/backend contract drift.',
          'Temporal can be introduced after local flow is proven.',
        ],
        weaknesses: [
          'Durable orchestration is not yet implemented in MVP.',
          'Local deterministic pipeline still needs persistence.',
        ],
        risks: [
          'Adding Temporal too early could slow iteration.',
          'In-memory run behavior will not survive restarts.',
        ],
        recommendations: [
          'Add persistence before real long-running jobs.',
          'Keep worker boundaries explicit in service interfaces.',
        ],
        roleSpecificInsights: {
          recommendedBoundary: 'API first, workers later',
        },
      },
      market_researcher: {
        summary:
          'The product should validate willingness to pay for build-ready artifacts before adding external research integrations.',
        strengths: [
          'Clear founder and indie hacker audience.',
          'Strong time-saving promise.',
        ],
        weaknesses: [
          'Market confidence remains limited without external data.',
          'Research agents should be paid-tier gated later.',
        ],
        risks: ['Competitors may position as broader AI product copilots.'],
        recommendations: [
          'Interview users after they try generated development prompts.',
          'Track artifact export and reuse behavior.',
        ],
        roleSpecificInsights: {
          confidence: draftRun.triage.marketConfidence,
        },
      },
      mobile_ux_expert: {
        summary:
          'If the idea targets mobile, the planning flow should emphasize lightweight review and concise artifact consumption.',
        strengths: ['Review checkpoints can work well on tablets and laptops.'],
        weaknesses: ['Long PRDs are hard to review on small screens.'],
        risks: ['Mobile-first UX could distract from core desktop builder workflows.'],
        recommendations: [
          'Optimize the MVP for desktop first.',
          'Use compact summaries before full artifact sections.',
        ],
        roleSpecificInsights: {
          recommendedDevicePriority: 'desktop_first',
        },
      },
    }

    return roleOutputs[agentRole]
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
