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
import { IndexingizabilityAdminService } from './indexingizability-admin.service.js'

type IndexingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('indexingizability')
export class IndexingizabilityController {
  constructor(
    private readonly indexingizabilityAdminService: IndexingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.indexingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIndexingizabilityRollout() {
    return this.indexingizabilityAdminService.getIndexingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIndexingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.indexingizabilityAdminService.getWorkspaceIndexingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIndexingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IndexingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_indexingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported indexingizability admin action.',
      })
    }

    return this.indexingizabilityAdminService.executeIndexingizabilityAdminAction(
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
