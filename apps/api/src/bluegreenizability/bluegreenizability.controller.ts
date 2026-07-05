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
import { BluegreenizabilityAdminService } from './bluegreenizability-admin.service.js'

type BluegreenizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('bluegreenizability')
export class BluegreenizabilityController {
  constructor(
    private readonly bluegreenizabilityAdminService: BluegreenizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.bluegreenizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBluegreenizabilityRollout() {
    return this.bluegreenizabilityAdminService.getBluegreenizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBluegreenizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.bluegreenizabilityAdminService.getWorkspaceBluegreenizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBluegreenizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BluegreenizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_bluegreenizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported bluegreenizability admin action.',
      })
    }

    return this.bluegreenizabilityAdminService.executeBluegreenizabilityAdminAction(
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
