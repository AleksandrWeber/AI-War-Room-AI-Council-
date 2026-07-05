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
import { ArchivizabilityAdminService } from './archivizability-admin.service.js'

type ArchivizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('archivizability')
export class ArchivizabilityController {
  constructor(
    private readonly archivizabilityAdminService: ArchivizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.archivizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getArchivizabilityRollout() {
    return this.archivizabilityAdminService.getArchivizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceArchivizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.archivizabilityAdminService.getWorkspaceArchivizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeArchivizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ArchivizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_archivizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported archivizability admin action.',
      })
    }

    return this.archivizabilityAdminService.executeArchivizabilityAdminAction(
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
