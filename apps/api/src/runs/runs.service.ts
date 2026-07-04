import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import {
  type AgentRole,
  type DraftRun,
  type MockPipelineResult,
  agentRoleSchema,
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
    private readonly moderatorService: ModeratorService,
    private readonly artifactService: ArtifactService,
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
    const moderatorSynthesis = await this.moderatorService.synthesize({
      draftRun: request.draftRun,
      approvedTriage: request.approvedTriage,
      agentOutputs,
    })
    const artifacts = await this.artifactService.generateArtifacts({
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
        this.createCompletedStep('agent_pool', 'Prompt-driven agent pool', now),
        this.createCompletedStep('moderator', 'Prompt-driven Moderator synthesis', now),
        this.createCompletedStep('artifacts', 'Prompt-driven artifact generation', now),
      ],
      agentOutputs,
      moderatorSynthesis,
      artifacts,
      completedAt: now,
    })

    await this.runRepository.saveMockPipelineResult(pipelineResult)

    return pipelineResult
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
