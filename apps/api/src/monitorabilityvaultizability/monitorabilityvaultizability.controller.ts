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
import { MonitorabilityvaultizabilityAdminService } from './monitorabilityvaultizability-admin.service.js'

type MonitorabilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('monitorabilityvaultizability')
export class MonitorabilityvaultizabilityController {
  constructor(
    private readonly monitorabilityvaultizabilityAdminService: MonitorabilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.monitorabilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMonitorabilityvaultizabilityRollout() {
    return this.monitorabilityvaultizabilityAdminService.getMonitorabilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMonitorabilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.monitorabilityvaultizabilityAdminService.getWorkspaceMonitorabilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMonitorabilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MonitorabilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_monitorabilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported monitorabilityvaultizability admin action.',
      })
    }

    return this.monitorabilityvaultizabilityAdminService.executeMonitorabilityvaultizabilityAdminAction(
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
