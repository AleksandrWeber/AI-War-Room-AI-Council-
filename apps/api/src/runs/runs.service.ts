import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import {
  type AgentRole,
  type ArtifactHistoryResponse,
  type ArtifactHistoryItem,
  type AuthContext,
  type DraftRun,
  type MockPipelineRequest,
  type MockPipelineResult,
  agentRoleSchema,
  artifactHistoryResponseSchema,
  createRunRequestSchema,
  draftRunSchema,
  mockPipelineRequestSchema,
  mockPipelineResultSchema,
  runStatusSchema,
} from '@ai-war-room/schemas'
import { AgentService } from '../agents/agent.service.js'
import { ArtifactService } from '../artifacts/artifact.service.js'
import type { ApiEnv } from '../config/env.js'
import { ModeratorService } from '../moderator/moderator.service.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import {
  RUN_REPOSITORY,
  type RunRepository,
} from '../persistence/run.repository.js'
import { TriageService } from '../triage/triage.service.js'
import { UsageService } from '../usage/usage.service.js'
import type { PipelineStreamEvent } from './pipeline-stream-event.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

type PipelineStreamEmitter = (event: PipelineStreamEvent) => void | Promise<void>

@Injectable()
export class RunsService {
  constructor(
    @Inject(RUN_REPOSITORY)
    private readonly runRepository: RunRepository,
    private readonly idempotencyService: IdempotencyService,
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly triageService: TriageService,
    private readonly agentService: AgentService,
    private readonly moderatorService: ModeratorService,
    private readonly artifactService: ArtifactService,
    private readonly usageService: UsageService,
    private readonly observabilityService: ObservabilityService,
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

  async listArtifactHistory(workspaceId: string): Promise<ArtifactHistoryResponse> {
    const artifacts = await this.runRepository.listArtifacts(workspaceId)

    return artifactHistoryResponseSchema.parse({
      workspaceId,
      artifacts,
    })
  }

  async exportArtifactMarkdown(input: {
    workspaceId: string
    artifactId: string
  }): Promise<string> {
    const artifact = await this.runRepository.findArtifactById(
      input.workspaceId,
      input.artifactId,
    )

    if (!artifact) {
      throw new NotFoundException({
        message: 'Artifact not found.',
      })
    }

    return this.renderArtifactMarkdown(artifact)
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

    const shieldScan = await this.triageService.scanInput({
      workspaceId: request.workspaceId,
      rawIdea: request.idea.rawIdea,
    })
    this.observabilityService.record('shield_scan_completed', {
      workspaceId: request.workspaceId,
      status: shieldScan.status,
      maxSeverity: shieldScan.maxSeverity,
      findingCount: shieldScan.findings.length,
    })

    if (shieldScan.status === 'blocked') {
      throw new ForbiddenException({
        message: 'Shield blocked critical input before execution.',
        shieldScan,
      })
    }

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

  async executeMockPipeline(
    input: unknown,
    authContext?: AuthContext,
  ): Promise<MockPipelineResult> {
    const request = this.parseMockPipelineRequest(input)

    return this.executeParsedPipeline(request, undefined, authContext)
  }

  async executeMockPipelineStream(
    input: unknown,
    emit: PipelineStreamEmitter,
    authContext?: AuthContext,
  ): Promise<MockPipelineResult> {
    const request = this.parseMockPipelineRequest(input)

    return this.executeParsedPipeline(request, emit, authContext)
  }

  private parseMockPipelineRequest(input: unknown): MockPipelineRequest {
    const parsedRequest = mockPipelineRequestSchema.safeParse(input)

    if (!parsedRequest.success) {
      throw new BadRequestException({
        message: 'Invalid mock pipeline request.',
        issues: parsedRequest.error.issues,
      })
    }

    return parsedRequest.data
  }

  private async executeParsedPipeline(
    request: MockPipelineRequest,
    emit?: PipelineStreamEmitter,
    authContext?: AuthContext,
  ): Promise<MockPipelineResult> {
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

    await this.observabilityService.measure(
      'pipeline_quota_check_completed',
      {
        workspaceId: request.draftRun.workspaceId,
        runId: request.draftRun.runId,
        estimatedMaxCostUsd: request.approvedTriage.estimatedMaxCostUsd,
      },
      () =>
        this.usageService.assertWorkspaceCanExecute({
          workspaceId: request.draftRun.workspaceId,
          estimatedMaxCostUsd: request.approvedTriage.estimatedMaxCostUsd,
        }),
    )

    await this.emitStatus(emit, 'agent_pool', 'Prompt-driven agent pool', 'running')
    const agentOutputs = await this.measurePipelinePhase(
      request,
      'agent_pool',
      () =>
        Promise.all(
          executableAgents.map((agentRole) =>
            this.agentService.executeAgent({
              runId: request.draftRun.runId,
              agentRole,
              draftRun: request.draftRun,
              completedAt: now,
            }),
          ),
        ),
      {
        agentCount: executableAgents.length,
      },
    )
    await this.emitStatus(emit, 'agent_pool', 'Prompt-driven agent pool', 'completed')

    await this.emitStatus(
      emit,
      'moderator',
      'Prompt-driven Moderator synthesis',
      'running',
    )
    const moderatorSynthesis = await this.measurePipelinePhase(
      request,
      'moderator',
      () =>
        this.moderatorService.synthesize({
          draftRun: request.draftRun,
          approvedTriage: request.approvedTriage,
          agentOutputs,
        }),
    )
    await this.emitStatus(
      emit,
      'moderator',
      'Prompt-driven Moderator synthesis',
      'completed',
    )

    await this.emitStatus(
      emit,
      'artifacts',
      'Prompt-driven artifact generation',
      'running',
    )
    const artifacts = await this.measurePipelinePhase(request, 'artifacts', () =>
      this.artifactService.generateArtifacts({
        draftRun: request.draftRun,
        moderatorSynthesis,
        completedAt: now,
      }),
    )
    for (const artifact of artifacts) {
      await emit?.({
        eventId: createId('event'),
        type: 'artifact',
        artifactType: artifact.metadata.artifactType,
        artifact,
        timestamp: new Date().toISOString(),
      })
    }
    await this.emitStatus(
      emit,
      'artifacts',
      'Prompt-driven artifact generation',
      'completed',
    )

    const pipelineResult = mockPipelineResultSchema.parse({
      runId: request.draftRun.runId,
      workspaceId: request.draftRun.workspaceId,
      status: 'completed',
      steps: [
        this.createCompletedStep('shield_scan', 'Shield scan', now),
        this.createCompletedStep('triage', 'Triage', now),
        this.createCompletedStep('agent_pool', 'Prompt-driven agent pool', now),
        this.createCompletedStep('moderator', 'Prompt-driven Moderator synthesis', now),
        this.createCompletedStep('artifacts', 'Prompt-driven artifact generation', now),
      ],
      agentOutputs,
      moderatorSynthesis,
      artifacts,
      completedAt: now,
    })

    await this.measurePipelinePhase(request, 'persistence', () =>
      this.runRepository.saveMockPipelineResult(pipelineResult),
    )
    const usageEvents = await this.measurePipelinePhase(request, 'usage_recording', () =>
      this.usageService.recordPipelineUsage({
        authContext,
        result: pipelineResult,
      }),
    )
    this.recordPipelineCostSignal(request, usageEvents)
    await emit?.({
      eventId: createId('event'),
      type: 'completed',
      result: pipelineResult,
      timestamp: new Date().toISOString(),
    })

    return pipelineResult
  }

  private async emitStatus(
    emit: PipelineStreamEmitter | undefined,
    stepId: string,
    label: string,
    status: 'running' | 'completed',
  ) {
    await emit?.({
      eventId: createId('event'),
      type: 'status',
      stepId,
      label,
      status,
      timestamp: new Date().toISOString(),
    })
  }

  private async measurePipelinePhase<T>(
    request: MockPipelineRequest,
    phase: string,
    operation: () => Promise<T>,
    attributes: Record<string, string | number | boolean | null> = {},
  ) {
    return this.observabilityService.measure(
      'pipeline_phase_completed',
      {
        workspaceId: request.draftRun.workspaceId,
        runId: request.draftRun.runId,
        phase,
        ...attributes,
      },
      operation,
    )
  }

  private recordPipelineCostSignal(
    request: MockPipelineRequest,
    usageEvents: Awaited<ReturnType<UsageService['recordPipelineUsage']>>,
  ) {
    const estimatedCostUsd = usageEvents.reduce(
      (total, event) => total + event.estimatedCostUsd,
      0,
    )
    const inputTokens = usageEvents.reduce(
      (total, event) => total + event.inputTokens,
      0,
    )
    const outputTokens = usageEvents.reduce(
      (total, event) => total + event.outputTokens,
      0,
    )
    const isCostAnomaly =
      estimatedCostUsd > request.approvedTriage.estimatedMaxCostUsd ||
      estimatedCostUsd >= 1

    this.observabilityService.record(
      'pipeline_cost_signal',
      {
        workspaceId: request.draftRun.workspaceId,
        runId: request.draftRun.runId,
        inputTokens,
        outputTokens,
        estimatedCostUsd,
        estimatedMaxCostUsd: request.approvedTriage.estimatedMaxCostUsd,
        usageEventCount: usageEvents.length,
        isCostAnomaly,
      },
      isCostAnomaly ? 'warn' : 'info',
    )
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

  private renderArtifactMarkdown(artifact: ArtifactHistoryItem) {
    const lines = [
      `# ${this.formatTitle(artifact.artifactType)}`,
      '',
      `- Artifact ID: ${artifact.artifactId}`,
      `- Run ID: ${artifact.runId}`,
      `- Version: ${artifact.artifactVersion}`,
      `- Created: ${artifact.createdAt}`,
      `- Prompt: ${artifact.metadata.promptVersion}`,
      '',
    ]

    for (const [key, value] of Object.entries(artifact.artifact.content)) {
      lines.push(`## ${this.formatTitle(key)}`, '')

      if (Array.isArray(value)) {
        for (const item of value) {
          lines.push(`- ${String(item)}`)
        }
      } else {
        lines.push(String(value))
      }

      lines.push('')
    }

    return lines.join('\n').trimEnd()
  }

  private formatTitle(value: string) {
    if (value === 'prd') {
      return 'PRD'
    }

    return value
      .split('_')
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(' ')
  }
}
