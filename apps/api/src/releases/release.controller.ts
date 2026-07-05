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
import { ReleaseAdminService } from './release-admin.service.js'

type ReleaseAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('releases')
export class ReleaseController {
  constructor(private readonly releaseAdminService: ReleaseAdminService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.releaseAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReleaseRollout() {
    return this.releaseAdminService.getReleaseRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReleaseAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.releaseAdminService.getWorkspaceReleaseAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReleaseAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReleaseAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_release_summary') {
      throw new BadRequestException({
        message: 'Unsupported release admin action.',
      })
    }

    return this.releaseAdminService.executeReleaseAdminAction(
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
