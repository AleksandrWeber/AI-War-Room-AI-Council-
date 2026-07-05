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
import { StreamizabilityAdminService } from './streamizability-admin.service.js'

type StreamizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('streamizability')
export class StreamizabilityController {
  constructor(
    private readonly streamizabilityAdminService: StreamizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.streamizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getStreamizabilityRollout() {
    return this.streamizabilityAdminService.getStreamizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceStreamizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.streamizabilityAdminService.getWorkspaceStreamizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeStreamizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: StreamizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_streamizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported streamizability admin action.',
      })
    }

    return this.streamizabilityAdminService.executeStreamizabilityAdminAction(
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
