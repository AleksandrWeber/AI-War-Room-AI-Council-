import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  type AuthContext,
  type MockPipelineRequest,
  type TemporalWorkflowStatus,
  mockPipelineRequestSchema,
  temporalRunStartResponseSchema,
  temporalRunStatusResponseSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
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
    @Inject(TEMPORAL_RUN_CLIENT)
    private readonly temporalRunClient: TemporalRunClient,
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

      return temporalRunStartResponseSchema.parse({
        runId: request.draftRun.runId,
        workspaceId: request.draftRun.workspaceId,
        workflowId: startedWorkflow.workflowId,
        temporalRunId: startedWorkflow.temporalRunId,
        taskQueue: workerConfig.taskQueue,
        status: 'running',
        temporalEnabled: true,
        startedAt,
      })
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

    try {
      const description = await this.observabilityService.measure(
        'temporal_workflow_status_checked',
        {
          workspaceId: input.authContext.workspaceId,
          workflowId: input.workflowId,
          taskQueue: workerConfig.taskQueue,
        },
        () =>
          this.temporalRunClient.describeDurableRun({
            address: workerConfig.address,
            namespace: workerConfig.namespace,
            workflowId: input.workflowId,
          }),
      )

      return temporalRunStatusResponseSchema.parse({
        workspaceId: input.authContext.workspaceId,
        workflowId: description.workflowId,
        temporalRunId: description.temporalRunId,
        taskQueue: workerConfig.taskQueue,
        status: this.normalizeStatus(description.status),
        temporalEnabled: true,
        checkedAt: new Date().toISOString(),
      })
    } catch (error) {
      throw new ServiceUnavailableException({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to query Temporal workflow status.',
        temporalEnabled: true,
      })
    }
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
