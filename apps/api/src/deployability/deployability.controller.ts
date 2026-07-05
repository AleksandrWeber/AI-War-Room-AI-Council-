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
import { DeployabilityAdminService } from './deployability-admin.service.js'

type DeployabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('deployability')
export class DeployabilityController {
  constructor(
    private readonly deployabilityAdminService: DeployabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.deployabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDeployabilityRollout() {
    return this.deployabilityAdminService.getDeployabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDeployabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.deployabilityAdminService.getWorkspaceDeployabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDeployabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DeployabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_deployability_summary') {
      throw new BadRequestException({
        message: 'Unsupported deployability admin action.',
      })
    }

    return this.deployabilityAdminService.executeDeployabilityAdminAction(
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
