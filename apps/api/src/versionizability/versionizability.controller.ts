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
import { VersionizabilityAdminService } from './versionizability-admin.service.js'

type VersionizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('versionizability')
export class VersionizabilityController {
  constructor(
    private readonly versionizabilityAdminService: VersionizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.versionizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getVersionizabilityRollout() {
    return this.versionizabilityAdminService.getVersionizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceVersionizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.versionizabilityAdminService.getWorkspaceVersionizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeVersionizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: VersionizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_versionizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported versionizability admin action.',
      })
    }

    return this.versionizabilityAdminService.executeVersionizabilityAdminAction(
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
