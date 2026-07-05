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
import { MonitorabilityAdminService } from './monitorability-admin.service.js'

type MonitorabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('monitorability')
export class MonitorabilityController {
  constructor(
    private readonly monitorabilityAdminService: MonitorabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.monitorabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMonitorabilityRollout() {
    return this.monitorabilityAdminService.getMonitorabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMonitorabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.monitorabilityAdminService.getWorkspaceMonitorabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMonitorabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MonitorabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_monitorability_summary') {
      throw new BadRequestException({
        message: 'Unsupported monitorability admin action.',
      })
    }

    return this.monitorabilityAdminService.executeMonitorabilityAdminAction(
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
