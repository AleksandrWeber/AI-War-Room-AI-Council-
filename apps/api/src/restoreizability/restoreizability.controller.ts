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
import { RestoreizabilityAdminService } from './restoreizability-admin.service.js'

type RestoreizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('restoreizability')
export class RestoreizabilityController {
  constructor(
    private readonly restoreizabilityAdminService: RestoreizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.restoreizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRestoreizabilityRollout() {
    return this.restoreizabilityAdminService.getRestoreizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRestoreizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.restoreizabilityAdminService.getWorkspaceRestoreizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRestoreizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RestoreizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_restoreizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported restoreizability admin action.',
      })
    }

    return this.restoreizabilityAdminService.executeRestoreizabilityAdminAction(
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
