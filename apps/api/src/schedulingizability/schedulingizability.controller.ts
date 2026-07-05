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
import { SchedulingizabilityAdminService } from './schedulingizability-admin.service.js'

type SchedulingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('schedulingizability')
export class SchedulingizabilityController {
  constructor(
    private readonly schedulingizabilityAdminService: SchedulingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.schedulingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSchedulingizabilityRollout() {
    return this.schedulingizabilityAdminService.getSchedulingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSchedulingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.schedulingizabilityAdminService.getWorkspaceSchedulingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSchedulingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SchedulingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_schedulingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported schedulingizability admin action.',
      })
    }

    return this.schedulingizabilityAdminService.executeSchedulingizabilityAdminAction(
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
