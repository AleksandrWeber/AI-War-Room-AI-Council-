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
import { DependabilityvaultizabilityAdminService } from './dependabilityvaultizability-admin.service.js'

type DependabilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('dependabilityvaultizability')
export class DependabilityvaultizabilityController {
  constructor(
    private readonly dependabilityvaultizabilityAdminService: DependabilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.dependabilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDependabilityvaultizabilityRollout() {
    return this.dependabilityvaultizabilityAdminService.getDependabilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDependabilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.dependabilityvaultizabilityAdminService.getWorkspaceDependabilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDependabilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DependabilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_dependabilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported dependabilityvaultizability admin action.',
      })
    }

    return this.dependabilityvaultizabilityAdminService.executeDependabilityvaultizabilityAdminAction(
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
