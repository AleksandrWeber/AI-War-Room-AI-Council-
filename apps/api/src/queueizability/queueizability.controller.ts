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
import { QueueizabilityAdminService } from './queueizability-admin.service.js'

type QueueizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('queueizability')
export class QueueizabilityController {
  constructor(
    private readonly queueizabilityAdminService: QueueizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.queueizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getQueueizabilityRollout() {
    return this.queueizabilityAdminService.getQueueizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceQueueizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.queueizabilityAdminService.getWorkspaceQueueizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeQueueizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: QueueizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_queueizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported queueizability admin action.',
      })
    }

    return this.queueizabilityAdminService.executeQueueizabilityAdminAction(
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
