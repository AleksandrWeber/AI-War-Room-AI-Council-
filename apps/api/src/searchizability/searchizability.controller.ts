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
import { SearchizabilityAdminService } from './searchizability-admin.service.js'

type SearchizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('searchizability')
export class SearchizabilityController {
  constructor(
    private readonly searchizabilityAdminService: SearchizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.searchizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSearchizabilityRollout() {
    return this.searchizabilityAdminService.getSearchizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSearchizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.searchizabilityAdminService.getWorkspaceSearchizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSearchizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SearchizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_searchizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported searchizability admin action.',
      })
    }

    return this.searchizabilityAdminService.executeSearchizabilityAdminAction(
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
