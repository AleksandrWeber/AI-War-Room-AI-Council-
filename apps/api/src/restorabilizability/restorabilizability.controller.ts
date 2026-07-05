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
import { RestorabilizabilityAdminService } from './restorabilizability-admin.service.js'

type RestorabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('restorabilizability')
export class RestorabilizabilityController {
  constructor(
    private readonly restorabilizabilityAdminService: RestorabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.restorabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRestorabilizabilityRollout() {
    return this.restorabilizabilityAdminService.getRestorabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRestorabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.restorabilizabilityAdminService.getWorkspaceRestorabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRestorabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RestorabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_restorabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported restorabilizability admin action.',
      })
    }

    return this.restorabilizabilityAdminService.executeRestorabilizabilityAdminAction(
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
