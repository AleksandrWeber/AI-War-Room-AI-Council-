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
import { FollowerizabilityAdminService } from './followerizability-admin.service.js'

type FollowerizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('followerizability')
export class FollowerizabilityController {
  constructor(
    private readonly followerizabilityAdminService: FollowerizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.followerizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFollowerizabilityRollout() {
    return this.followerizabilityAdminService.getFollowerizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFollowerizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.followerizabilityAdminService.getWorkspaceFollowerizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFollowerizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FollowerizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_followerizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported followerizability admin action.',
      })
    }

    return this.followerizabilityAdminService.executeFollowerizabilityAdminAction(
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
