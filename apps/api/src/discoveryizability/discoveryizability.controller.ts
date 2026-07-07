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
import { DiscoveryizabilityAdminService } from './discoveryizability-admin.service.js'

type DiscoveryizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('discoveryizability')
export class DiscoveryizabilityController {
  constructor(
    private readonly discoveryizabilityAdminService: DiscoveryizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.discoveryizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDiscoveryizabilityRollout() {
    return this.discoveryizabilityAdminService.getDiscoveryizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDiscoveryizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.discoveryizabilityAdminService.getWorkspaceDiscoveryizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDiscoveryizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DiscoveryizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_discoveryizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported discoveryizability admin action.',
      })
    }

    return this.discoveryizabilityAdminService.executeDiscoveryizabilityAdminAction(
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
