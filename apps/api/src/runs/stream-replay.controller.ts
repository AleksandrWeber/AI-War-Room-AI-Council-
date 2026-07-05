import {
  Body,
  Controller,
  BadRequestException,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  type AuthenticatedRequest,
  WorkspaceAccessGuard,
} from '../auth/workspace-access.guard.js'
import { StreamRecoveryAdminService } from './stream-recovery-admin.service.js'

type StreamRecoveryAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('runs/stream')
export class StreamReplayController {
  constructor(
    private readonly streamRecoveryAdminService: StreamRecoveryAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.streamRecoveryAdminService.getCapabilities()
  }

  @Get('readiness')
  async getStreamReplayRollout() {
    return this.streamRecoveryAdminService.getStreamReplayRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceStreamRecoveryAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.streamRecoveryAdminService.getWorkspaceStreamRecoveryAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeStreamRecoveryAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: StreamRecoveryAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (
      action !== 'refresh_stream_recovery_summary' &&
      action !== 'clear_workspace_stream_buffers'
    ) {
      throw new BadRequestException({
        message: 'Unsupported stream recovery admin action.',
      })
    }

    return this.streamRecoveryAdminService.executeStreamRecoveryAdminAction(
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
