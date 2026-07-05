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
import { PluggabilizabilityAdminService } from './pluggabilizability-admin.service.js'

type PluggabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('pluggabilizability')
export class PluggabilizabilityController {
  constructor(
    private readonly pluggabilizabilityAdminService: PluggabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.pluggabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPluggabilizabilityRollout() {
    return this.pluggabilizabilityAdminService.getPluggabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePluggabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.pluggabilizabilityAdminService.getWorkspacePluggabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePluggabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PluggabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_pluggabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported pluggabilizability admin action.',
      })
    }

    return this.pluggabilizabilityAdminService.executePluggabilizabilityAdminAction(
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
