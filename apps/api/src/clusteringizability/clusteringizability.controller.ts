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
import { ClusteringizabilityAdminService } from './clusteringizability-admin.service.js'

type ClusteringizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('clusteringizability')
export class ClusteringizabilityController {
  constructor(
    private readonly clusteringizabilityAdminService: ClusteringizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.clusteringizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getClusteringizabilityRollout() {
    return this.clusteringizabilityAdminService.getClusteringizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceClusteringizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.clusteringizabilityAdminService.getWorkspaceClusteringizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeClusteringizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ClusteringizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_clusteringizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported clusteringizability admin action.',
      })
    }

    return this.clusteringizabilityAdminService.executeClusteringizabilityAdminAction(
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
