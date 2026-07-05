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
import { AsynchronizabilityAdminService } from './asynchronizability-admin.service.js'

type AsynchronizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('asynchronizability')
export class AsynchronizabilityController {
  constructor(
    private readonly asynchronizabilityAdminService: AsynchronizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.asynchronizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAsynchronizabilityRollout() {
    return this.asynchronizabilityAdminService.getAsynchronizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAsynchronizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.asynchronizabilityAdminService.getWorkspaceAsynchronizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAsynchronizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AsynchronizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_asynchronizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported asynchronizability admin action.',
      })
    }

    return this.asynchronizabilityAdminService.executeAsynchronizabilityAdminAction(
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
