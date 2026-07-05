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
import { TimeoutizabilityAdminService } from './timeoutizability-admin.service.js'

type TimeoutizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('timeoutizability')
export class TimeoutizabilityController {
  constructor(
    private readonly timeoutizabilityAdminService: TimeoutizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.timeoutizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTimeoutizabilityRollout() {
    return this.timeoutizabilityAdminService.getTimeoutizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTimeoutizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.timeoutizabilityAdminService.getWorkspaceTimeoutizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTimeoutizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TimeoutizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_timeoutizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported timeoutizability admin action.',
      })
    }

    return this.timeoutizabilityAdminService.executeTimeoutizabilityAdminAction(
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
