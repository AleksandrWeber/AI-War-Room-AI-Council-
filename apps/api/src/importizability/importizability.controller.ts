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
import { ImportizabilityAdminService } from './importizability-admin.service.js'

type ImportizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('importizability')
export class ImportizabilityController {
  constructor(
    private readonly importizabilityAdminService: ImportizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.importizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getImportizabilityRollout() {
    return this.importizabilityAdminService.getImportizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceImportizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.importizabilityAdminService.getWorkspaceImportizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeImportizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ImportizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_importizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported importizability admin action.',
      })
    }

    return this.importizabilityAdminService.executeImportizabilityAdminAction(
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
