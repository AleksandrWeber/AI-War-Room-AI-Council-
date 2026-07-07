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
import { TelemetryizabilityAdminService } from './telemetryizability-admin.service.js'

type TelemetryizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('telemetryizability')
export class TelemetryizabilityController {
  constructor(
    private readonly telemetryizabilityAdminService: TelemetryizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.telemetryizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTelemetryizabilityRollout() {
    return this.telemetryizabilityAdminService.getTelemetryizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTelemetryizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.telemetryizabilityAdminService.getWorkspaceTelemetryizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTelemetryizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TelemetryizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_telemetryizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported telemetryizability admin action.',
      })
    }

    return this.telemetryizabilityAdminService.executeTelemetryizabilityAdminAction(
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
