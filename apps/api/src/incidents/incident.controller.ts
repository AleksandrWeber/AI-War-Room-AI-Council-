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
import { IncidentAdminService } from './incident-admin.service.js'

type IncidentAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('incidents')
export class IncidentController {
  constructor(
    private readonly incidentAdminService: IncidentAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.incidentAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIncidentResponseRollout() {
    return this.incidentAdminService.getIncidentResponseRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIncidentAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.incidentAdminService.getWorkspaceIncidentAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIncidentAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IncidentAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_incident_summary') {
      throw new BadRequestException({
        message: 'Unsupported incident admin action.',
      })
    }

    return this.incidentAdminService.executeIncidentAdminAction(
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
