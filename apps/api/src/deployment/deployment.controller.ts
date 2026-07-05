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
import { DeploymentAdminService } from './deployment-admin.service.js'

type DeploymentAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('deployment')
export class DeploymentController {
  constructor(
    private readonly deploymentAdminService: DeploymentAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.deploymentAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDeploymentRollout() {
    return this.deploymentAdminService.getDeploymentRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDeploymentAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.deploymentAdminService.getWorkspaceDeploymentAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDeploymentAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DeploymentAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_deployment_summary') {
      throw new BadRequestException({
        message: 'Unsupported deployment admin action.',
      })
    }

    return this.deploymentAdminService.executeDeploymentAdminAction(
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
