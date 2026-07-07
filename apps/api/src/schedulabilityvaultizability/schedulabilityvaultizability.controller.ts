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
import { SchedulabilityvaultizabilityAdminService } from './schedulabilityvaultizability-admin.service.js'

type SchedulabilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('schedulabilityvaultizability')
export class SchedulabilityvaultizabilityController {
  constructor(
    private readonly schedulabilityvaultizabilityAdminService: SchedulabilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.schedulabilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSchedulabilityvaultizabilityRollout() {
    return this.schedulabilityvaultizabilityAdminService.getSchedulabilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSchedulabilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.schedulabilityvaultizabilityAdminService.getWorkspaceSchedulabilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSchedulabilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SchedulabilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_schedulabilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported schedulabilityvaultizability admin action.',
      })
    }

    return this.schedulabilityvaultizabilityAdminService.executeSchedulabilityvaultizabilityAdminAction(
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
