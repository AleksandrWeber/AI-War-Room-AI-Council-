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
import { ExportizabilityAdminService } from './exportizability-admin.service.js'

type ExportizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('exportizability')
export class ExportizabilityController {
  constructor(
    private readonly exportizabilityAdminService: ExportizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.exportizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getExportizabilityRollout() {
    return this.exportizabilityAdminService.getExportizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceExportizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.exportizabilityAdminService.getWorkspaceExportizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeExportizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ExportizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_exportizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported exportizability admin action.',
      })
    }

    return this.exportizabilityAdminService.executeExportizabilityAdminAction(
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
