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
import { RoutingizabilityAdminService } from './routingizability-admin.service.js'

type RoutingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('routingizability')
export class RoutingizabilityController {
  constructor(
    private readonly routingizabilityAdminService: RoutingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.routingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRoutingizabilityRollout() {
    return this.routingizabilityAdminService.getRoutingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRoutingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.routingizabilityAdminService.getWorkspaceRoutingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRoutingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RoutingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_routingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported routingizability admin action.',
      })
    }

    return this.routingizabilityAdminService.executeRoutingizabilityAdminAction(
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
