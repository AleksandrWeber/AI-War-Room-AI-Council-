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
import { EpistemizabilityAdminService } from './epistemizability-admin.service.js'

type EpistemizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('epistemizability')
export class EpistemizabilityController {
  constructor(
    private readonly epistemizabilityAdminService: EpistemizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.epistemizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEpistemizabilityRollout() {
    return this.epistemizabilityAdminService.getEpistemizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEpistemizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.epistemizabilityAdminService.getWorkspaceEpistemizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEpistemizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EpistemizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_epistemizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported epistemizability admin action.',
      })
    }

    return this.epistemizabilityAdminService.executeEpistemizabilityAdminAction(
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
