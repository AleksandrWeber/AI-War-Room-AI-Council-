import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { randomUUID } from 'node:crypto'
import { ZodError } from 'zod'
import {
  WorkspaceAccessGuard,
  type AuthenticatedRequest,
} from '../auth/workspace-access.guard.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import { TemporalRunService } from '../temporal/temporal-run.service.js'
import { TemporalHealthService } from '../temporal/temporal-health.service.js'
import { TemporalRolloutService } from '../temporal/temporal-rollout.service.js'
import type { PipelineStreamEvent } from './pipeline-stream-event.js'
import { isTerminalPipelineStreamEvent } from './pipeline-stream-event.js'
import { RunsService } from './runs.service.js'
import { RunFeedbackService } from './run-feedback.service.js'

@Controller('runs')
export class RunsController {
  constructor(
    private readonly runsService: RunsService,
    private readonly runFeedbackService: RunFeedbackService,
    private readonly streamEventBufferService: StreamEventBufferService,
    private readonly temporalRunService: TemporalRunService,
    private readonly temporalHealthService: TemporalHealthService,
    private readonly temporalRolloutService: TemporalRolloutService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.runsService.getCapabilities()
  }

  @Get('artifacts/history')
  @UseGuards(WorkspaceAccessGuard)
  listArtifactHistory(@Req() request: AuthenticatedRequest) {
    return this.runsService.listArtifactHistory(request.authContext!.workspaceId)
  }

  @Get('artifacts/:artifactId/export/markdown')
  @UseGuards(WorkspaceAccessGuard)
  async exportArtifactMarkdown(
    @Param('artifactId') artifactId: string,
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
  ) {
    const markdown = await this.runsService.exportArtifactMarkdown({
      workspaceId: request.authContext!.workspaceId,
      artifactId,
    })

    reply.header('Content-Type', 'text/markdown; charset=utf-8')
    reply.header(
      'Content-Disposition',
      `attachment; filename="${artifactId}.md"`,
    )
    reply.send(markdown)
  }

  @Get('artifacts/:artifactId/export/pdf')
  @UseGuards(WorkspaceAccessGuard)
  async exportArtifactPdf(
    @Param('artifactId') artifactId: string,
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
  ) {
    const pdf = await this.runsService.exportArtifactPdf({
      workspaceId: request.authContext!.workspaceId,
      artifactId,
    })

    reply.header('Content-Type', 'application/pdf')
    reply.header(
      'Content-Disposition',
      `attachment; filename="${artifactId}.pdf"`,
    )
    reply.send(pdf)
  }

  @Post('feedback')
  @UseGuards(WorkspaceAccessGuard)
  createRunFeedback(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.runFeedbackService.createFeedback({
      authContext: request.authContext!,
      body,
    })
  }

  @Post(':runId/agents/:role/regenerate')
  @UseGuards(WorkspaceAccessGuard)
  regenerateAgent(
    @Param('runId') runId: string,
    @Param('role') role: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.runsService.regenerateAgent({
      runId,
      agentRole: role,
      body,
      authContext: request.authContext!,
    })
  }

  @Get(':runId/feedback')
  @UseGuards(WorkspaceAccessGuard)
  listRunFeedback(
    @Param('runId') runId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.runFeedbackService.listForRun({
      workspaceId: request.authContext!.workspaceId,
      runId,
    })
  }

  @Post('draft')
  @UseGuards(WorkspaceAccessGuard)
  createDraftRun(@Body() body: unknown) {
    return this.runsService.createDraftRun(body)
  }

  @Post('mock-pipeline')
  @UseGuards(WorkspaceAccessGuard)
  executeMockPipeline(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.runsService.executeMockPipeline(body, request.authContext)
  }

  @Get('temporal/health')
  getTemporalHealth() {
    return this.temporalHealthService.getRuntimeHealth()
  }

  @Get('temporal/capabilities')
  getTemporalCapabilities() {
    return this.temporalRolloutService.getCapabilities()
  }

  @Get('temporal/readiness')
  getTemporalRollout() {
    return this.temporalRolloutService.getTemporalRollout()
  }

  @Post('workflows')
  @UseGuards(WorkspaceAccessGuard)
  startWorkflow(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.temporalRunService.startApprovedRun(body, request.authContext!)
  }

  @Get('workflows/by-run/:runId')
  @UseGuards(WorkspaceAccessGuard)
  getWorkflowByRunId(
    @Param('runId') runId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.temporalRunService.getWorkflowByRunId({
      runId,
      authContext: request.authContext!,
    })
  }

  @Post('workflows/:workflowId/recover')
  @UseGuards(WorkspaceAccessGuard)
  recoverWorkflowObservation(
    @Param('workflowId') workflowId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.temporalRunService.recoverWorkflowObservation({
      workflowId,
      authContext: request.authContext!,
    })
  }

  @Get('workflows/:workflowId/status')
  @UseGuards(WorkspaceAccessGuard)
  getWorkflowStatus(
    @Param('workflowId') workflowId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.temporalRunService.getWorkflowStatus({
      workflowId,
      authContext: request.authContext!,
    })
  }

  @Get('workflows/:workflowId/observation')
  @UseGuards(WorkspaceAccessGuard)
  getWorkflowObservation(
    @Param('workflowId') workflowId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.temporalRunService.getWorkflowObservation({
      workflowId,
      authContext: request.authContext!,
    })
  }

  @Get('workflows/:workflowId/stream')
  @UseGuards(WorkspaceAccessGuard)
  async streamWorkflowObservation(
    @Param('workflowId') workflowId: string,
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
  ) {
    const lastEventId = this.getSingleHeader(request.headers['last-event-id'])

    reply.raw.writeHead(200, this.buildSseHeaders(request))

    try {
      await this.temporalRunService.observeWorkflowStream({
        workflowId,
        authContext: request.authContext!,
        afterEventId: lastEventId,
        shouldContinue: () => !reply.raw.destroyed,
        onEvent: async (event) => {
          this.writeStreamEvent(reply, event)
        },
      })
    } catch (error) {
      this.writeStreamEvent(reply, {
        eventId: `event_${randomUUID()}`,
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to observe Temporal workflow.',
        timestamp: new Date().toISOString(),
      })
    } finally {
      reply.raw.end()
    }
  }

  @Post('mock-pipeline/stream')
  @UseGuards(WorkspaceAccessGuard)
  async executeMockPipelineStream(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
  ) {
    const workspaceId = request.authContext!.workspaceId
    const runId = this.resolveStreamRunId(body)
    const lastEventId = this.getSingleHeader(request.headers['last-event-id'])

    reply.raw.writeHead(200, this.buildSseHeaders(request))

    const send = async (event: PipelineStreamEvent) => {
      if (reply.raw.destroyed) {
        return
      }

      const bufferedEvent = runId
        ? await this.streamEventBufferService.append({
            workspaceId,
            runId,
            event,
          })
        : event

      this.writeStreamEvent(reply, bufferedEvent)
    }

    const heartbeat = setInterval(() => {
      if (reply.raw.destroyed) {
        return
      }

      this.writeStreamEvent(reply, {
        eventId: `event_${randomUUID()}`,
        type: 'status',
        stepId: 'heartbeat',
        label: 'Still working…',
        status: 'running',
        timestamp: new Date().toISOString(),
      })
    }, 10_000)

    try {
      if (runId && lastEventId) {
        const replayedEvents = await this.streamEventBufferService.replayAfter({
          workspaceId,
          runId,
          afterEventId: lastEventId,
        })

        for (const event of replayedEvents) {
          this.writeStreamEvent(reply, event)
        }

        if (replayedEvents.some((event) => this.isTerminalEvent(event))) {
          return
        }
      }

      await this.runsService.executeMockPipelineStream(
        body,
        send,
        request.authContext,
      )
    } catch (error) {
      send({
        eventId: `event_${randomUUID()}`,
        type: 'error',
        message: this.formatPipelineError(error),
        timestamp: new Date().toISOString(),
      })
    } finally {
      clearInterval(heartbeat)
      reply.raw.end()
    }
  }

  @Post('approve-idea/stream')
  @UseGuards(WorkspaceAccessGuard)
  async approveIdeaStream(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
  ) {
    reply.raw.writeHead(200, this.buildSseHeaders(request))

    const send = async (event: PipelineStreamEvent) => {
      if (reply.raw.destroyed) {
        return
      }

      this.writeStreamEvent(reply, event)
    }

    try {
      await this.runsService.approveIdea(
        body,
        request.authContext!,
        send,
      )
    } catch (error) {
      send({
        eventId: `event_${randomUUID()}`,
        type: 'error',
        message: this.formatPipelineError(error),
        timestamp: new Date().toISOString(),
      })
    } finally {
      reply.raw.end()
    }
  }

  @Post('generate-prompt/stream')
  @UseGuards(WorkspaceAccessGuard)
  async generatePromptStream(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
  ) {
    reply.raw.writeHead(200, this.buildSseHeaders(request))

    const send = async (event: PipelineStreamEvent) => {
      if (reply.raw.destroyed) {
        return
      }

      this.writeStreamEvent(reply, event)
    }

    try {
      await this.runsService.generateMasterPrompt(
        body,
        request.authContext!,
        send,
      )
    } catch (error) {
      send({
        eventId: `event_${randomUUID()}`,
        type: 'error',
        message: this.formatPipelineError(error),
        timestamp: new Date().toISOString(),
      })
    } finally {
      reply.raw.end()
    }
  }

  @Post('generate-todo/stream')
  @UseGuards(WorkspaceAccessGuard)
  async generateTodoStream(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
  ) {
    reply.raw.writeHead(200, this.buildSseHeaders(request))

    const send = async (event: PipelineStreamEvent) => {
      if (reply.raw.destroyed) {
        return
      }

      this.writeStreamEvent(reply, event)
    }

    try {
      await this.runsService.generateTodoList(
        body,
        request.authContext!,
        send,
      )
    } catch (error) {
      send({
        eventId: `event_${randomUUID()}`,
        type: 'error',
        message: this.formatPipelineError(error),
        timestamp: new Date().toISOString(),
      })
    } finally {
      reply.raw.end()
    }
  }

  @Post('explain-idea')
  @UseGuards(WorkspaceAccessGuard)
  explainIdea(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.runsService.explainIdea(body, request.authContext!)
  }

  private formatPipelineError(error: unknown) {
    if (error instanceof ZodError) {
      return error.issues
        .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
        .join('; ')
    }

    if (error instanceof Error) {
      return error.message
    }

    return 'Failed to execute pipeline.'
  }

  private writeStreamEvent(reply: FastifyReply, event: PipelineStreamEvent) {
    reply.raw.write(`event: ${event.type}\n`)
    reply.raw.write(`id: ${event.eventId}\n`)
    reply.raw.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  private buildSseHeaders(request: AuthenticatedRequest) {
    const origin = this.getSingleHeader(request.headers.origin)
    const headers: Record<string, string> = {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    }

    // reply.raw.writeHead replaces Fastify CORS headers; restore them for browsers.
    if (origin) {
      headers['Access-Control-Allow-Origin'] = origin
      headers.Vary = 'Origin'
    }

    return headers
  }

  private isTerminalEvent(event: PipelineStreamEvent) {
    return isTerminalPipelineStreamEvent(event)
  }

  private resolveStreamRunId(body: unknown) {
    if (
      typeof body === 'object' &&
      body !== null &&
      'draftRun' in body &&
      typeof body.draftRun === 'object' &&
      body.draftRun !== null &&
      'runId' in body.draftRun &&
      typeof body.draftRun.runId === 'string'
    ) {
      return body.draftRun.runId
    }

    return null
  }

  private getSingleHeader(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value
  }
}
