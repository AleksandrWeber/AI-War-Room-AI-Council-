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
import { LinkabilityAdminService } from './linkability-admin.service.js'

type LinkabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('linkability')
export class LinkabilityController {
  constructor(
    private readonly linkabilityAdminService: LinkabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.linkabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getLinkabilityRollout() {
    return this.linkabilityAdminService.getLinkabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceLinkabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.linkabilityAdminService.getWorkspaceLinkabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeLinkabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: LinkabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_linkability_summary') {
      throw new BadRequestException({
        message: 'Unsupported linkability admin action.',
      })
    }

    return this.linkabilityAdminService.executeLinkabilityAdminAction(
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
