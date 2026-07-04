import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { randomUUID } from 'node:crypto'
import {
  WorkspaceAccessGuard,
  type AuthenticatedRequest,
} from '../auth/workspace-access.guard.js'
import { RunsService, type PipelineStreamEvent } from './runs.service.js'

@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.runsService.getCapabilities()
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

  @Post('mock-pipeline/stream')
  @UseGuards(WorkspaceAccessGuard)
  async executeMockPipelineStream(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
  ) {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    })

    const send = (event: PipelineStreamEvent) => {
      reply.raw.write(`event: ${event.type}\n`)
      reply.raw.write(`id: ${event.eventId}\n`)
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`)
    }

    try {
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
}
