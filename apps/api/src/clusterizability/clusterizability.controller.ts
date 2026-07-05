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
import { ClusterizabilityAdminService } from './clusterizability-admin.service.js'

type ClusterizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('clusterizability')
export class ClusterizabilityController {
  constructor(
    private readonly clusterizabilityAdminService: ClusterizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.clusterizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getClusterizabilityRollout() {
    return this.clusterizabilityAdminService.getClusterizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceClusterizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.clusterizabilityAdminService.getWorkspaceClusterizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeClusterizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ClusterizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_clusterizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported clusterizability admin action.',
      })
    }

    return this.clusterizabilityAdminService.executeClusterizabilityAdminAction(
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
