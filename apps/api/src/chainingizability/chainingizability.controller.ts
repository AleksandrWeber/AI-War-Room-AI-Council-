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
import { ChainingizabilityAdminService } from './chainingizability-admin.service.js'

type ChainingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('chainingizability')
export class ChainingizabilityController {
  constructor(
    private readonly chainingizabilityAdminService: ChainingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.chainingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getChainingizabilityRollout() {
    return this.chainingizabilityAdminService.getChainingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceChainingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.chainingizabilityAdminService.getWorkspaceChainingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeChainingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ChainingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_chainingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported chainingizability admin action.',
      })
    }

    return this.chainingizabilityAdminService.executeChainingizabilityAdminAction(
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
