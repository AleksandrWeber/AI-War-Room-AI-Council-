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
import { CollectizabilityAdminService } from './collectizability-admin.service.js'

type CollectizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('collectizability')
export class CollectizabilityController {
  constructor(
    private readonly collectizabilityAdminService: CollectizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.collectizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCollectizabilityRollout() {
    return this.collectizabilityAdminService.getCollectizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCollectizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.collectizabilityAdminService.getWorkspaceCollectizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCollectizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CollectizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_collectizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported collectizability admin action.',
      })
    }

    return this.collectizabilityAdminService.executeCollectizabilityAdminAction(
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
