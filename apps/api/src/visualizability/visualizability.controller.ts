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
import { VisualizabilityAdminService } from './visualizability-admin.service.js'

type VisualizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('visualizability')
export class VisualizabilityController {
  constructor(
    private readonly visualizabilityAdminService: VisualizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.visualizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getVisualizabilityRollout() {
    return this.visualizabilityAdminService.getVisualizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceVisualizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.visualizabilityAdminService.getWorkspaceVisualizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeVisualizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: VisualizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_visualizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported visualizability admin action.',
      })
    }

    return this.visualizabilityAdminService.executeVisualizabilityAdminAction(
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
