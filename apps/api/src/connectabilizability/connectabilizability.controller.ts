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
import { ConnectabilizabilityAdminService } from './connectabilizability-admin.service.js'

type ConnectabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('connectabilizability')
export class ConnectabilizabilityController {
  constructor(
    private readonly connectabilizabilityAdminService: ConnectabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.connectabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConnectabilizabilityRollout() {
    return this.connectabilizabilityAdminService.getConnectabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConnectabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.connectabilizabilityAdminService.getWorkspaceConnectabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConnectabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConnectabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_connectabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported connectabilizability admin action.',
      })
    }

    return this.connectabilizabilityAdminService.executeConnectabilizabilityAdminAction(
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
