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
import { VersioningizabilityAdminService } from './versioningizability-admin.service.js'

type VersioningizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('versioningizability')
export class VersioningizabilityController {
  constructor(
    private readonly versioningizabilityAdminService: VersioningizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.versioningizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getVersioningizabilityRollout() {
    return this.versioningizabilityAdminService.getVersioningizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceVersioningizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.versioningizabilityAdminService.getWorkspaceVersioningizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeVersioningizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: VersioningizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_versioningizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported versioningizability admin action.',
      })
    }

    return this.versioningizabilityAdminService.executeVersioningizabilityAdminAction(
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
