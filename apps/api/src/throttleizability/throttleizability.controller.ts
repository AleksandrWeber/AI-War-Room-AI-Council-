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
import { ThrottleizabilityAdminService } from './throttleizability-admin.service.js'

type ThrottleizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('throttleizability')
export class ThrottleizabilityController {
  constructor(
    private readonly throttleizabilityAdminService: ThrottleizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.throttleizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getThrottleizabilityRollout() {
    return this.throttleizabilityAdminService.getThrottleizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceThrottleizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.throttleizabilityAdminService.getWorkspaceThrottleizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeThrottleizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ThrottleizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_throttleizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported throttleizability admin action.',
      })
    }

    return this.throttleizabilityAdminService.executeThrottleizabilityAdminAction(
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
