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
import { IndexizabilityAdminService } from './indexizability-admin.service.js'

type IndexizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('indexizability')
export class IndexizabilityController {
  constructor(
    private readonly indexizabilityAdminService: IndexizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.indexizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIndexizabilityRollout() {
    return this.indexizabilityAdminService.getIndexizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIndexizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.indexizabilityAdminService.getWorkspaceIndexizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIndexizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IndexizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_indexizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported indexizability admin action.',
      })
    }

    return this.indexizabilityAdminService.executeIndexizabilityAdminAction(
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
