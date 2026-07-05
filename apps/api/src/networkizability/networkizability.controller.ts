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
import { NetworkizabilityAdminService } from './networkizability-admin.service.js'

type NetworkizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('networkizability')
export class NetworkizabilityController {
  constructor(
    private readonly networkizabilityAdminService: NetworkizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.networkizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNetworkizabilityRollout() {
    return this.networkizabilityAdminService.getNetworkizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNetworkizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.networkizabilityAdminService.getWorkspaceNetworkizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNetworkizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NetworkizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_networkizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported networkizability admin action.',
      })
    }

    return this.networkizabilityAdminService.executeNetworkizabilityAdminAction(
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
