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
import { ArchiveizabilityAdminService } from './archiveizability-admin.service.js'

type ArchiveizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('archiveizability')
export class ArchiveizabilityController {
  constructor(
    private readonly archiveizabilityAdminService: ArchiveizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.archiveizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getArchiveizabilityRollout() {
    return this.archiveizabilityAdminService.getArchiveizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceArchiveizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.archiveizabilityAdminService.getWorkspaceArchiveizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeArchiveizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ArchiveizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_archiveizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported archiveizability admin action.',
      })
    }

    return this.archiveizabilityAdminService.executeArchiveizabilityAdminAction(
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
