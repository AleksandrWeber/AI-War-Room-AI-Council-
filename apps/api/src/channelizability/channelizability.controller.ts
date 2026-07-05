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
import { ChannelizabilityAdminService } from './channelizability-admin.service.js'

type ChannelizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('channelizability')
export class ChannelizabilityController {
  constructor(
    private readonly channelizabilityAdminService: ChannelizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.channelizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getChannelizabilityRollout() {
    return this.channelizabilityAdminService.getChannelizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceChannelizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.channelizabilityAdminService.getWorkspaceChannelizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeChannelizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ChannelizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_channelizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported channelizability admin action.',
      })
    }

    return this.channelizabilityAdminService.executeChannelizabilityAdminAction(
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
