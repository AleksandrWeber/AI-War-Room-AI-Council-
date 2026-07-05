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
import { BroadcastizabilityAdminService } from './broadcastizability-admin.service.js'

type BroadcastizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('broadcastizability')
export class BroadcastizabilityController {
  constructor(
    private readonly broadcastizabilityAdminService: BroadcastizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.broadcastizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBroadcastizabilityRollout() {
    return this.broadcastizabilityAdminService.getBroadcastizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBroadcastizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.broadcastizabilityAdminService.getWorkspaceBroadcastizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBroadcastizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BroadcastizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_broadcastizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported broadcastizability admin action.',
      })
    }

    return this.broadcastizabilityAdminService.executeBroadcastizabilityAdminAction(
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
