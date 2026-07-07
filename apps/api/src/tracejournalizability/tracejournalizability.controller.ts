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
import { TracejournalizabilityAdminService } from './tracejournalizability-admin.service.js'

type TracejournalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('tracejournalizability')
export class TracejournalizabilityController {
  constructor(
    private readonly tracejournalizabilityAdminService: TracejournalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.tracejournalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTracejournalizabilityRollout() {
    return this.tracejournalizabilityAdminService.getTracejournalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTracejournalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.tracejournalizabilityAdminService.getWorkspaceTracejournalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTracejournalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TracejournalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_tracejournalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported tracejournalizability admin action.',
      })
    }

    return this.tracejournalizabilityAdminService.executeTracejournalizabilityAdminAction(
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
