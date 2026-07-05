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
import { QueryizabilityAdminService } from './queryizability-admin.service.js'

type QueryizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('queryizability')
export class QueryizabilityController {
  constructor(
    private readonly queryizabilityAdminService: QueryizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.queryizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getQueryizabilityRollout() {
    return this.queryizabilityAdminService.getQueryizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceQueryizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.queryizabilityAdminService.getWorkspaceQueryizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeQueryizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: QueryizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_queryizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported queryizability admin action.',
      })
    }

    return this.queryizabilityAdminService.executeQueryizabilityAdminAction(
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
