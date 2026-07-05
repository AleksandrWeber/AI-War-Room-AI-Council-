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
import { GroupizabilityAdminService } from './groupizability-admin.service.js'

type GroupizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('groupizability')
export class GroupizabilityController {
  constructor(
    private readonly groupizabilityAdminService: GroupizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.groupizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getGroupizabilityRollout() {
    return this.groupizabilityAdminService.getGroupizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceGroupizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.groupizabilityAdminService.getWorkspaceGroupizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeGroupizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: GroupizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_groupizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported groupizability admin action.',
      })
    }

    return this.groupizabilityAdminService.executeGroupizabilityAdminAction(
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
