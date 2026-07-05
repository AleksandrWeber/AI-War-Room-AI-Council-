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
import { ConnectabilityAdminService } from './connectability-admin.service.js'

type ConnectabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('connectability')
export class ConnectabilityController {
  constructor(
    private readonly connectabilityAdminService: ConnectabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.connectabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConnectabilityRollout() {
    return this.connectabilityAdminService.getConnectabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConnectabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.connectabilityAdminService.getWorkspaceConnectabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConnectabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConnectabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_connectability_summary') {
      throw new BadRequestException({
        message: 'Unsupported connectability admin action.',
      })
    }

    return this.connectabilityAdminService.executeConnectabilityAdminAction(
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
