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
import { DependableizabilityAdminService } from './dependableizability-admin.service.js'

type DependableizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('dependableizability')
export class DependableizabilityController {
  constructor(
    private readonly dependableizabilityAdminService: DependableizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.dependableizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDependableizabilityRollout() {
    return this.dependableizabilityAdminService.getDependableizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDependableizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.dependableizabilityAdminService.getWorkspaceDependableizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDependableizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DependableizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_dependableizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported dependableizability admin action.',
      })
    }

    return this.dependableizabilityAdminService.executeDependableizabilityAdminAction(
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
