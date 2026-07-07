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
import { ControlizabilityAdminService } from './controlizability-admin.service.js'

type ControlizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('controlizability')
export class ControlizabilityController {
  constructor(
    private readonly controlizabilityAdminService: ControlizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.controlizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getControlizabilityRollout() {
    return this.controlizabilityAdminService.getControlizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceControlizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.controlizabilityAdminService.getWorkspaceControlizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeControlizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ControlizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_controlizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported controlizability admin action.',
      })
    }

    return this.controlizabilityAdminService.executeControlizabilityAdminAction(
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
