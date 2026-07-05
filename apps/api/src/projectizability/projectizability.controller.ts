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
import { ProjectizabilityAdminService } from './projectizability-admin.service.js'

type ProjectizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('projectizability')
export class ProjectizabilityController {
  constructor(
    private readonly projectizabilityAdminService: ProjectizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.projectizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProjectizabilityRollout() {
    return this.projectizabilityAdminService.getProjectizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProjectizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.projectizabilityAdminService.getWorkspaceProjectizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProjectizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProjectizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_projectizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported projectizability admin action.',
      })
    }

    return this.projectizabilityAdminService.executeProjectizabilityAdminAction(
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
