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
import { DirectoryizabilityAdminService } from './directoryizability-admin.service.js'

type DirectoryizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('directoryizability')
export class DirectoryizabilityController {
  constructor(
    private readonly directoryizabilityAdminService: DirectoryizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.directoryizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDirectoryizabilityRollout() {
    return this.directoryizabilityAdminService.getDirectoryizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDirectoryizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.directoryizabilityAdminService.getWorkspaceDirectoryizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDirectoryizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DirectoryizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_directoryizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported directoryizability admin action.',
      })
    }

    return this.directoryizabilityAdminService.executeDirectoryizabilityAdminAction(
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
