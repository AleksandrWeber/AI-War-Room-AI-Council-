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
import { DeployabilizabilityAdminService } from './deployabilizability-admin.service.js'

type DeployabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('deployabilizability')
export class DeployabilizabilityController {
  constructor(
    private readonly deployabilizabilityAdminService: DeployabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.deployabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDeployabilizabilityRollout() {
    return this.deployabilizabilityAdminService.getDeployabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDeployabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.deployabilizabilityAdminService.getWorkspaceDeployabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDeployabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DeployabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_deployabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported deployabilizability admin action.',
      })
    }

    return this.deployabilizabilityAdminService.executeDeployabilizabilityAdminAction(
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
