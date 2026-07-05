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
import { DispatchizabilityAdminService } from './dispatchizability-admin.service.js'

type DispatchizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('dispatchizability')
export class DispatchizabilityController {
  constructor(
    private readonly dispatchizabilityAdminService: DispatchizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.dispatchizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDispatchizabilityRollout() {
    return this.dispatchizabilityAdminService.getDispatchizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDispatchizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.dispatchizabilityAdminService.getWorkspaceDispatchizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDispatchizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DispatchizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_dispatchizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported dispatchizability admin action.',
      })
    }

    return this.dispatchizabilityAdminService.executeDispatchizabilityAdminAction(
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
