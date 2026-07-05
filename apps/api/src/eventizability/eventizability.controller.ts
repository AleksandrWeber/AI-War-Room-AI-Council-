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
import { EventizabilityAdminService } from './eventizability-admin.service.js'

type EventizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('eventizability')
export class EventizabilityController {
  constructor(
    private readonly eventizabilityAdminService: EventizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.eventizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEventizabilityRollout() {
    return this.eventizabilityAdminService.getEventizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEventizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.eventizabilityAdminService.getWorkspaceEventizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEventizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EventizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_eventizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported eventizability admin action.',
      })
    }

    return this.eventizabilityAdminService.executeEventizabilityAdminAction(
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
