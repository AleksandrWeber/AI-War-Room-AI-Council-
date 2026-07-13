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
      const bufferedEvent = runId
        ? await this.streamEventBufferService.append({
            workspaceId,
            runId,
            event,
          })
        : event

      this.writeStreamEvent(reply, bufferedEvent)
    }

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
        message:
          error instanceof Error ? error.message : 'Failed to execute pipeline.',
        timestamp: new Date().toISOString(),
      })
    } finally {
      reply.raw.end()
    }
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
