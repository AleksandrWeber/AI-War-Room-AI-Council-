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
import { MapizabilityAdminService } from './mapizability-admin.service.js'

type MapizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('mapizability')
export class MapizabilityController {
  constructor(
    private readonly mapizabilityAdminService: MapizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.mapizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMapizabilityRollout() {
    return this.mapizabilityAdminService.getMapizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMapizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.mapizabilityAdminService.getWorkspaceMapizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMapizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MapizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_mapizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported mapizability admin action.',
      })
    }

    return this.mapizabilityAdminService.executeMapizabilityAdminAction(
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
