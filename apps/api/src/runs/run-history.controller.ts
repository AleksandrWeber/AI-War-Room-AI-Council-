import {
  Body,
  Controller,
  BadRequestException,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import {
  type AuthenticatedRequest,
  WorkspaceAccessGuard,
} from '../auth/workspace-access.guard.js'
import { RunHistoryAdminService } from './run-history-admin.service.js'

type RunHistoryAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('runs/history')
export class RunHistoryController {
  constructor(private readonly runHistoryAdminService: RunHistoryAdminService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.runHistoryAdminService.getCapabilities()
  }

  @Get('readiness')
  getRunHistoryRollout() {
    return this.runHistoryAdminService.getRunHistoryRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  getWorkspaceRunHistoryAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.runHistoryAdminService.getWorkspaceRunHistoryAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Get('workspace/:workspaceId/admin/export')
  @UseGuards(WorkspaceAccessGuard)
  async exportWorkspaceRunHistory(
    @Param('workspaceId') workspaceId: string,
    @Query('format') format: string | undefined,
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const exportFormat = format === 'csv' || format === 'json' ? format : null

    if (!exportFormat) {
      throw new BadRequestException({
        message: 'format query parameter must be csv or json.',
      })
    }

    const exported = await this.runHistoryAdminService.exportWorkspaceRunHistory(
      request.authContext!,
      workspaceId,
      exportFormat,
    )

    reply.header('Content-Type', exported.contentType)
    reply.header(
      'Content-Disposition',
      `attachment; filename="${exported.filename}"`,
    )
    reply.send(exported.body)
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  executeRunHistoryAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RunHistoryAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_run_history_summary') {
      throw new BadRequestException({
        message: 'Unsupported run history admin action.',
      })
    }

    return this.runHistoryAdminService.executeRunHistoryAdminAction(
      request.authContext!,
      {
        workspaceId,
        action,
      },
    )
  }

  private assertWorkspaceParam(
    request: AuthenticatedRequest,
    workspaceId: string,
  ) {
    const requestWorkspaceId = request.authContext?.workspaceId

    if (requestWorkspaceId && requestWorkspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace parameter does not match authenticated workspace.',
      })
    }
  }
}
