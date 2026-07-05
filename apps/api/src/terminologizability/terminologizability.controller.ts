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
import { TerminologizabilityAdminService } from './terminologizability-admin.service.js'

type TerminologizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('terminologizability')
export class TerminologizabilityController {
  constructor(
    private readonly terminologizabilityAdminService: TerminologizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.terminologizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTerminologizabilityRollout() {
    return this.terminologizabilityAdminService.getTerminologizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTerminologizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.terminologizabilityAdminService.getWorkspaceTerminologizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTerminologizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TerminologizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_terminologizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported terminologizability admin action.',
      })
    }

    return this.terminologizabilityAdminService.executeTerminologizabilityAdminAction(
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
