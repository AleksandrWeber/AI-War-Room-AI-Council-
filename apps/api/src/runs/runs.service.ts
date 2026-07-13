import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import PDFDocument from 'pdfkit'
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
  regenerateAgentRequestSchema,
  runCapabilitiesResponseSchema,
  runStatusSchema,
} from '@ai-war-room/schemas'
import { AgentService } from '../agents/agent.service.js'
import { ArtifactService } from '../artifacts/artifact.service.js'
import { ChunkSummaryService } from '../chunk-summary/chunk-summary.service.js'
import type { ApiEnv } from '../config/env.js'
import { ModeratorService } from '../moderator/moderator.service.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import {
  RUN_REPOSITORY,
  type RunRepository,
} from '../persistence/run.repository.js'
import { ShieldOverrideService } from '../shield/shield-override.service.js'
import { ShieldFullScanRetainService } from '../shield/shield-full-scan-retain.service.js'
import { TriageService } from '../triage/triage.service.js'
import { UsageService } from '../usage/usage.service.js'
import { BillingMeterUsageService } from '../billing/billing-meter-usage.service.js'
import { BillingNotificationService } from '../billing/billing-notification.service.js'
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
    private readonly chunkSummaryService: ChunkSummaryService,
    private readonly moderatorService: ModeratorService,
    private readonly artifactService: ArtifactService,
    private readonly usageService: UsageService,
    private readonly billingMeterUsageService: BillingMeterUsageService,
    private readonly billingNotificationService: BillingNotificationService,
    private readonly observabilityService: ObservabilityService,
    private readonly shieldOverrideService: ShieldOverrideService,
    private readonly shieldFullScanRetainService: ShieldFullScanRetainService,
  ) {}

  getCapabilities() {
    const temporalEnabled = this.configService.get('TEMPORAL_ENABLED', {
      infer: true,
    })

    return runCapabilitiesResponseSchema.parse({
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
      runtime: {
        defaultPath: temporalEnabled ? 'temporal' : 'direct',
        temporalEnabled,
        taskQueue: this.configService.get('TEMPORAL_TASK_QUEUE', { infer: true }),
      },
    })
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
    const artifact = await this.requireArtifact(input)
    return this.renderArtifactMarkdown(artifact)
  }

  async exportArtifactPdf(input: {
    workspaceId: string
    artifactId: string
  }): Promise<Buffer> {
    const artifact = await this.requireArtifact(input)
    return this.renderArtifactPdf(artifact)
  }

  private async requireArtifact(input: {
    workspaceId: string
    artifactId: string
  }): Promise<ArtifactHistoryItem> {
    const artifact = await this.runRepository.findArtifactById(
      input.workspaceId,
      input.artifactId,
    )

    if (!artifact) {
      throw new NotFoundException({
        message: 'Artifact not found.',
      })
    }

    return artifact
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
    await this.shieldFullScanRetainService.maybeRetainFullScan(draftRun)

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

  async regenerateAgent(input: {
    runId: string
    agentRole: string
    body: unknown
    authContext: AuthContext
  }): Promise<MockPipelineResult> {
    const parsedRole = agentRoleSchema
      .exclude(['moderator'])
      .safeParse(input.agentRole)

    if (!parsedRole.success) {
      throw new BadRequestException({
        message: 'Invalid agent role for regeneration.',
        issues: parsedRole.error.issues,
      })
    }

    const parsedBody = regenerateAgentRequestSchema.safeParse(input.body)

    if (!parsedBody.success) {
      throw new BadRequestException({
        message: 'Invalid regenerate agent request.',
        issues: parsedBody.error.issues,
      })
    }

    const request = parsedBody.data
    const agentRole = parsedRole.data

    if (request.draftRun.runId !== input.runId) {
      throw new BadRequestException({
        message: 'draftRun.runId must match the path runId.',
      })
    }

    if (request.previousResult.runId !== input.runId) {
      throw new BadRequestException({
        message: 'previousResult.runId must match the path runId.',
      })
    }

    if (
      request.draftRun.workspaceId !== input.authContext.workspaceId ||
      request.previousResult.workspaceId !== input.authContext.workspaceId
    ) {
      throw new BadRequestException({
        message: 'Run workspace must match the authenticated workspace.',
      })
    }

    const storedResult = await this.runRepository.findCompletedPipelineResult(
      input.authContext.workspaceId,
      input.runId,
    )
    const baseline = storedResult ?? request.previousResult

    if (!baseline.agentOutputs.some((output) => output.agentRole === agentRole)) {
      throw new NotFoundException({
        message: `Agent role ${agentRole} was not part of this completed run.`,
      })
    }

    await this.shieldOverrideService.assertExecutionAllowed({
      runId: request.draftRun.runId,
      workspaceId: request.draftRun.workspaceId,
      shieldStatus: request.draftRun.shieldScan.status,
      maxSeverity: request.draftRun.shieldScan.maxSeverity,
    })

    const estimatedMaxCostUsd = Math.min(
      request.approvedTriage.estimatedMaxCostUsd,
      0.75,
    )

    await this.usageService.assertWorkspaceCanExecute({
      workspaceId: request.draftRun.workspaceId,
      estimatedMaxCostUsd,
    })

    const now = new Date().toISOString()
    const regenerated = await this.agentService.executeAgent({
      runId: request.draftRun.runId,
      agentRole,
      draftRun: request.draftRun,
      completedAt: now,
    })

    const agentOutputs = baseline.agentOutputs.map((output) =>
      output.agentRole === agentRole ? regenerated : output,
    )
    const chunkSummaries =
      await this.chunkSummaryService.summarizeAgentOutputs({
        agentOutputs,
        workspaceId: request.draftRun.workspaceId,
      })
    const moderatorSynthesis = await this.moderatorService.synthesize({
      draftRun: request.draftRun,
      approvedTriage: request.approvedTriage,
      agentOutputs,
      chunkSummaries,
    })
    const artifacts = await this.artifactService.generateArtifacts({
      draftRun: request.draftRun,
      moderatorSynthesis,
      completedAt: now,
      developmentPromptTargetTool: request.developmentPromptTargetTool,
    })

    const pipelineResult = mockPipelineResultSchema.parse({
      runId: request.draftRun.runId,
      workspaceId: request.draftRun.workspaceId,
      status: 'completed',
      steps: baseline.steps.map((step) => ({
        ...step,
        status: 'completed',
        completedAt: now,
      })),
      agentOutputs,
      moderatorSynthesis,
      artifacts,
      completedAt: now,
    })

    await this.runRepository.replaceCompletedPipelineResult(pipelineResult)

    const usageSlice = mockPipelineResultSchema.parse({
      ...pipelineResult,
      agentOutputs: [regenerated],
    })
    const usageEvents = await this.usageService.recordPipelineUsage({
      authContext: input.authContext,
      result: usageSlice,
    })
    const totalTokens = usageEvents.reduce(
      (total, event) => total + event.inputTokens + event.outputTokens,
      0,
    )
    await this.billingMeterUsageService.reportRunTokenUsage({
      workspaceId: request.draftRun.workspaceId,
      runId: request.draftRun.runId,
      totalTokens,
    })
    await this.billingNotificationService.syncWorkspaceNotifications(
      request.draftRun.workspaceId,
    )
    this.observabilityService.record('agent_regenerated', {
      workspaceId: request.draftRun.workspaceId,
      runId: request.draftRun.runId,
      agentRole,
      totalTokens,
    })

    return pipelineResult
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

    await this.shieldOverrideService.assertExecutionAllowed({
      runId: request.draftRun.runId,
      workspaceId: request.draftRun.workspaceId,
      shieldStatus: request.draftRun.shieldScan.status,
      maxSeverity: request.draftRun.shieldScan.maxSeverity,
    })

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
    const chunkSummaries = await this.chunkSummaryService.summarizeAgentOutputs({
      agentOutputs,
      workspaceId: request.draftRun.workspaceId,
    })
    const moderatorSynthesis = await this.measurePipelinePhase(
      request,
      'moderator',
      () =>
        this.moderatorService.synthesize({
          draftRun: request.draftRun,
          approvedTriage: request.approvedTriage,
          agentOutputs,
          chunkSummaries,
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
        developmentPromptTargetTool: request.developmentPromptTargetTool,
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
    const totalTokens = usageEvents.reduce(
      (total, event) => total + event.inputTokens + event.outputTokens,
      0,
    )
    await this.billingMeterUsageService.reportRunTokenUsage({
      workspaceId: request.draftRun.workspaceId,
      runId: request.draftRun.runId,
      totalTokens,
    })
    await this.billingNotificationService.syncWorkspaceNotifications(
      request.draftRun.workspaceId,
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

  private renderArtifactPdf(artifact: ArtifactHistoryItem): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 54,
        info: {
          Title: this.formatTitle(artifact.artifactType),
          Author: 'AI War Room',
          Subject: `Run ${artifact.runId}`,
        },
      })
      const chunks: Buffer[] = []

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })
      doc.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      doc.on('error', reject)

      doc.fontSize(18).text(this.formatTitle(artifact.artifactType), {
        underline: true,
      })
      doc.moveDown(0.5)
      doc.fontSize(10).fillColor('#444444')
      doc.text(`Artifact ID: ${artifact.artifactId}`)
      doc.text(`Run ID: ${artifact.runId}`)
      doc.text(`Version: ${artifact.artifactVersion}`)
      doc.text(`Created: ${artifact.createdAt}`)
      doc.text(`Prompt: ${artifact.metadata.promptVersion}`)
      doc.moveDown()
      doc.fillColor('#000000')

      for (const [key, value] of Object.entries(artifact.artifact.content)) {
        doc.fontSize(13).text(this.formatTitle(key), { underline: true })
        doc.moveDown(0.35)
        doc.fontSize(11)

        if (Array.isArray(value)) {
          for (const item of value) {
            doc.text(`• ${String(item)}`, {
              indent: 12,
              paragraphGap: 4,
            })
          }
        } else {
          doc.text(String(value), {
            paragraphGap: 6,
          })
        }

        doc.moveDown(0.75)
      }

      doc.end()
    })
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
