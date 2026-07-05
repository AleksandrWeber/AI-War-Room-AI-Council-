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
import { SchedulizabilityAdminService } from './schedulizability-admin.service.js'

type SchedulizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('schedulizability')
export class SchedulizabilityController {
  constructor(
    private readonly schedulizabilityAdminService: SchedulizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.schedulizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSchedulizabilityRollout() {
    return this.schedulizabilityAdminService.getSchedulizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSchedulizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.schedulizabilityAdminService.getWorkspaceSchedulizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSchedulizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SchedulizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_schedulizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported schedulizability admin action.',
      })
    }

    return this.schedulizabilityAdminService.executeSchedulizabilityAdminAction(
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
