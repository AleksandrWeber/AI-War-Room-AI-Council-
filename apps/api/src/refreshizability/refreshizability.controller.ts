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
import { RefreshizabilityAdminService } from './refreshizability-admin.service.js'

type RefreshizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('refreshizability')
export class RefreshizabilityController {
  constructor(
    private readonly refreshizabilityAdminService: RefreshizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.refreshizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRefreshizabilityRollout() {
    return this.refreshizabilityAdminService.getRefreshizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRefreshizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.refreshizabilityAdminService.getWorkspaceRefreshizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRefreshizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RefreshizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_refreshizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported refreshizability admin action.',
      })
    }

    return this.refreshizabilityAdminService.executeRefreshizabilityAdminAction(
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
