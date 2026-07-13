import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import {
  type AuthContext,
  type MockPipelineRequest,
  type TemporalWorkflowRecord,
  type TemporalWorkflowStatus,
  getTemporalRecoveryHint,
  mockPipelineRequestSchema,
  temporalRunStartResponseSchema,
  temporalRunStatusResponseSchema,
  temporalWorkflowObservationResponseSchema,
  temporalWorkflowRecoveryResponseSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import {
  TEMPORAL_WORKFLOW_REPOSITORY,
  type TemporalWorkflowRepository,
} from '../persistence/temporal-workflow.repository.js'
import {
  isTerminalPipelineStreamEvent,
  type PipelineStreamEvent,
} from '../runs/pipeline-stream-event.js'
import { ShieldOverrideService } from '../shield/shield-override.service.js'
import { getTemporalWorkerConfig } from './temporal-worker.config.js'
import {
  TEMPORAL_RUN_CLIENT,
  type TemporalRunClient,
} from './temporal-run-client.js'

@Injectable()
export class TemporalRunService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly observabilityService: ObservabilityService,
    private readonly streamEventBufferService: StreamEventBufferService,
    @Inject(TEMPORAL_WORKFLOW_REPOSITORY)
    private readonly temporalWorkflowRepository: TemporalWorkflowRepository,
    @Inject(TEMPORAL_RUN_CLIENT)
    private readonly temporalRunClient: TemporalRunClient,
    private readonly shieldOverrideService: ShieldOverrideService,
  ) {}

  async startApprovedRun(input: unknown, authContext: AuthContext) {
    const request = this.parsePipelineRequest(input, authContext)
    const workerConfig = getTemporalWorkerConfig(this.configService)

    if (!workerConfig.enabled) {
      throw new ServiceUnavailableException({
        message:
          'Temporal workflow start is disabled. Set TEMPORAL_ENABLED=true and run a Temporal worker to use this endpoint.',
        temporalEnabled: false,
      })
    }

    await this.shieldOverrideService.assertExecutionAllowed({
      runId: request.draftRun.runId,
      workspaceId: request.draftRun.workspaceId,
      shieldStatus: request.draftRun.shieldScan.status,
      maxSeverity: request.draftRun.shieldScan.maxSeverity,
    })

    const workflowId = this.createWorkflowId(request)
    const startedAt = new Date().toISOString()

    try {
      const startedWorkflow = await this.observabilityService.measure(
        'temporal_workflow_start_completed',
        {
          workspaceId: request.draftRun.workspaceId,
          runId: request.draftRun.runId,
          workflowId,
          taskQueue: workerConfig.taskQueue,
        },
        () =>
          this.temporalRunClient.startDurableRun({
            address: workerConfig.address,
            namespace: workerConfig.namespace,
            taskQueue: workerConfig.taskQueue,
            workflowId,
            input: {
              request,
              authContext,
              requestedAt: startedAt,
            },
          }),
      )

      const response = temporalRunStartResponseSchema.parse({
        runId: request.draftRun.runId,
        workspaceId: request.draftRun.workspaceId,
        workflowId: startedWorkflow.workflowId,
        temporalRunId: startedWorkflow.temporalRunId,
        taskQueue: workerConfig.taskQueue,
        status: 'running',
        temporalEnabled: true,
        startedAt,
      })
      const workflow = await this.temporalWorkflowRepository.saveStartedWorkflow({
        runId: response.runId,
        workspaceId: response.workspaceId,
        workflowId: response.workflowId,
        temporalRunId: response.temporalRunId,
        taskQueue: response.taskQueue,
        status: response.status,
        startedAt: response.startedAt,
      })

      await this.publishWorkflowStatus(workflow)

      return response
    } catch (error) {
      throw new ServiceUnavailableException({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to start Temporal workflow.',
        temporalEnabled: true,
      })
    }
  }

  async getWorkflowStatus(input: {
    workflowId: string
    authContext: AuthContext
  }) {
    const workerConfig = getTemporalWorkerConfig(this.configService)

    if (!workerConfig.enabled) {
      throw new ServiceUnavailableException({
        message:
          'Temporal workflow status is disabled. Set TEMPORAL_ENABLED=true to query Temporal workflow status.',
        temporalEnabled: false,
      })
    }

    this.assertWorkflowBelongsToWorkspace(input.workflowId, input.authContext.workspaceId)
    await this.requireWorkflow({
      workspaceId: input.authContext.workspaceId,
      workflowId: input.workflowId,
    })

    try {
      const synced = await this.syncWorkflowStatusFromTemporal({
        workspaceId: input.authContext.workspaceId,
        workflowId: input.workflowId,
        taskQueue: workerConfig.taskQueue,
      })

      return temporalRunStatusResponseSchema.parse({
        runId: synced.record.runId,
        workspaceId: input.authContext.workspaceId,
        workflowId: synced.workflowId,
        temporalRunId: synced.temporalRunId,
        taskQueue: workerConfig.taskQueue,
        status: synced.status,
        temporalEnabled: true,
        checkedAt: synced.checkedAt,
      })
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      throw new ServiceUnavailableException({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to query Temporal workflow status.',
        temporalEnabled: true,
      })
    }
  }

  async recoverWorkflowObservation(input: {
    workflowId: string
    authContext: AuthContext
  }) {
    this.assertWorkflowBelongsToWorkspace(
      input.workflowId,
      input.authContext.workspaceId,
    )
    const existingWorkflow = await this.requireWorkflow({
      workspaceId: input.authContext.workspaceId,
      workflowId: input.workflowId,
    })
    const workerConfig = getTemporalWorkerConfig(this.configService)

    if (!workerConfig.enabled) {
      return temporalWorkflowRecoveryResponseSchema.parse({
        workflow: existingWorkflow,
        syncedFromTemporal: false,
        recoveryHint: getTemporalRecoveryHint(existingWorkflow.status, false),
      })
    }

    try {
      const synced = await this.syncWorkflowStatusFromTemporal({
        workspaceId: input.authContext.workspaceId,
        workflowId: input.workflowId,
        taskQueue: workerConfig.taskQueue,
      })

      return temporalWorkflowRecoveryResponseSchema.parse({
        workflow: synced.record,
        syncedFromTemporal: true,
        recoveryHint: getTemporalRecoveryHint(synced.record.status, true),
      })
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      return temporalWorkflowRecoveryResponseSchema.parse({
        workflow: existingWorkflow,
        syncedFromTemporal: false,
        recoveryHint: getTemporalRecoveryHint(existingWorkflow.status, false),
      })
    }
  }

  async getWorkflowByRunId(input: {
    runId: string
    authContext: AuthContext
  }) {
    const workflow = await this.temporalWorkflowRepository.findWorkflowByRunId({
      workspaceId: input.authContext.workspaceId,
      runId: input.runId,
    })

    if (!workflow) {
      throw new NotFoundException({
        message: 'No Temporal workflow metadata was found for this run.',
      })
    }

    return temporalWorkflowObservationResponseSchema.parse({
      workflow,
    })
  }

  async getWorkflowObservation(input: {
    workflowId: string
    authContext: AuthContext
  }) {
    const workflow = await this.requireWorkflow({
      workspaceId: input.authContext.workspaceId,
      workflowId: input.workflowId,
    })

    return temporalWorkflowObservationResponseSchema.parse({
      workflow,
    })
  }

  async getWorkflowStreamEvents(input: {
    workflowId: string
    authContext: AuthContext
    afterEventId?: string
    allowStatusFallback?: boolean
  }) {
    const workflow = await this.requireWorkflow({
      workspaceId: input.authContext.workspaceId,
      workflowId: input.workflowId,
    })
    const allowStatusFallback = input.allowStatusFallback ?? true

    if (!input.afterEventId) {
      const bufferedEvents = await this.streamEventBufferService.replayAll({
        workspaceId: workflow.workspaceId,
        runId: workflow.runId,
      })

      if (bufferedEvents.length > 0) {
        return bufferedEvents
      }

      if (allowStatusFallback) {
        return [await this.publishWorkflowStatus(workflow)]
      }

      return []
    }

    const replayedEvents = await this.streamEventBufferService.replayAfter({
      workspaceId: workflow.workspaceId,
      runId: workflow.runId,
      afterEventId: input.afterEventId,
    })

    if (replayedEvents.length > 0) {
      return replayedEvents
    }

    if (allowStatusFallback) {
      return [await this.publishWorkflowStatus(workflow)]
    }

    return []
  }

  async observeWorkflowStream(input: {
    workflowId: string
    authContext: AuthContext
    afterEventId?: string
    onEvent: (event: PipelineStreamEvent) => void | Promise<void>
    shouldContinue?: () => boolean
  }) {
    const pollIntervalMs = this.configService.get('TEMPORAL_WORKFLOW_STREAM_POLL_MS', {
      infer: true,
    })
    const timeoutMs = this.configService.get('TEMPORAL_WORKFLOW_STREAM_TIMEOUT_MS', {
      infer: true,
    })
    const deadline = Date.now() + timeoutMs
    let lastEventId = input.afterEventId
    let terminated = false

    const emitBatch = async (events: PipelineStreamEvent[]) => {
      for (const event of events) {
        await input.onEvent(event)
        lastEventId = event.eventId

        if (isTerminalPipelineStreamEvent(event)) {
          terminated = true
          return
        }
      }
    }

    await emitBatch(
      await this.getWorkflowStreamEvents({
        workflowId: input.workflowId,
        authContext: input.authContext,
        afterEventId: lastEventId,
        allowStatusFallback: true,
      }),
    )

    while (
      !terminated &&
      Date.now() < deadline &&
      (input.shouldContinue?.() ?? true)
    ) {
      await this.sleep(pollIntervalMs)

      await emitBatch(
        await this.getWorkflowStreamEvents({
          workflowId: input.workflowId,
          authContext: input.authContext,
          afterEventId: lastEventId,
          allowStatusFallback: false,
        }),
      )
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private parsePipelineRequest(input: unknown, authContext: AuthContext) {
    const parsedRequest = mockPipelineRequestSchema.safeParse(input)

    if (!parsedRequest.success) {
      throw new BadRequestException({
        message: 'Invalid Temporal workflow start request.',
        issues: parsedRequest.error.issues,
      })
    }

    if (parsedRequest.data.draftRun.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    return parsedRequest.data
  }

  private createWorkflowId(request: MockPipelineRequest) {
    return `ai-war-room-${request.draftRun.workspaceId}-${request.draftRun.runId}`
  }

  private assertWorkflowBelongsToWorkspace(
    workflowId: string,
    workspaceId: string,
  ) {
    if (!workflowId.startsWith(`ai-war-room-${workspaceId}-`)) {
      throw new ForbiddenException({
        message: 'Workflow does not belong to the current workspace.',
      })
    }
  }

  private async requireWorkflow(input: {
    workspaceId: string
    workflowId: string
  }) {
    const workflow = await this.temporalWorkflowRepository.findWorkflowById(input)

    if (!workflow) {
      throw new NotFoundException({
        message: 'Temporal workflow metadata was not found.',
      })
    }

    return workflow
  }

  private publishWorkflowStatus(workflow: TemporalWorkflowRecord) {
    return this.streamEventBufferService.append({
      workspaceId: workflow.workspaceId,
      runId: workflow.runId,
      event: {
        eventId: `event_${randomUUID()}`,
        type: 'workflow_status',
        runId: workflow.runId,
        workflowId: workflow.workflowId,
        temporalRunId: workflow.temporalRunId,
        taskQueue: workflow.taskQueue,
        status: workflow.status,
        timestamp: workflow.updatedAt,
      },
    })
  }

  private async syncWorkflowStatusFromTemporal(input: {
    workspaceId: string
    workflowId: string
    taskQueue: string
  }) {
    const workerConfig = getTemporalWorkerConfig(this.configService)
    const description = await this.observabilityService.measure(
      'temporal_workflow_status_checked',
      {
        workspaceId: input.workspaceId,
        workflowId: input.workflowId,
        taskQueue: input.taskQueue,
      },
      () =>
        this.temporalRunClient.describeDurableRun({
          address: workerConfig.address,
          namespace: workerConfig.namespace,
          workflowId: input.workflowId,
        }),
    )
    const status = this.normalizeStatus(description.status)
    const checkedAt = new Date().toISOString()
    const record = await this.temporalWorkflowRepository.updateWorkflowStatus({
      workspaceId: input.workspaceId,
      workflowId: description.workflowId,
      temporalRunId: description.temporalRunId,
      status,
      checkedAt,
    })

    if (!record) {
      throw new NotFoundException({
        message: 'Temporal workflow metadata was not found.',
      })
    }

    await this.publishWorkflowStatus(record)

    return {
      record,
      workflowId: description.workflowId,
      temporalRunId: description.temporalRunId,
      status,
      checkedAt,
    }
  }

  private normalizeStatus(status: string): TemporalWorkflowStatus {
    const normalized = status.toLowerCase()

    if (normalized.includes('running')) {
      return 'running'
    }

    if (normalized.includes('completed')) {
      return 'completed'
    }

    if (normalized.includes('failed')) {
      return 'failed'
    }

    if (normalized.includes('canceled') || normalized.includes('cancelled')) {
      return 'canceled'
    }

    if (normalized.includes('terminated')) {
      return 'terminated'
    }

    if (normalized.includes('timed_out') || normalized.includes('timeout')) {
      return 'timed_out'
    }

    if (normalized.includes('continued')) {
      return 'continued_as_new'
    }

    return 'unknown'
  }
}
