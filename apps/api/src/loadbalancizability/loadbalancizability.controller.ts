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
import { LoadbalancizabilityAdminService } from './loadbalancizability-admin.service.js'

type LoadbalancizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('loadbalancizability')
export class LoadbalancizabilityController {
  constructor(
    private readonly loadbalancizabilityAdminService: LoadbalancizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.loadbalancizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getLoadbalancizabilityRollout() {
    return this.loadbalancizabilityAdminService.getLoadbalancizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceLoadbalancizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.loadbalancizabilityAdminService.getWorkspaceLoadbalancizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeLoadbalancizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: LoadbalancizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_loadbalancizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported loadbalancizability admin action.',
      })
    }

    return this.loadbalancizabilityAdminService.executeLoadbalancizabilityAdminAction(
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
