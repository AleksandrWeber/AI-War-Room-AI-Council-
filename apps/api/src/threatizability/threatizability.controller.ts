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
import { ThreatizabilityAdminService } from './threatizability-admin.service.js'

type ThreatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('threatizability')
export class ThreatizabilityController {
  constructor(
    private readonly threatizabilityAdminService: ThreatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.threatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getThreatizabilityRollout() {
    return this.threatizabilityAdminService.getThreatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceThreatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.threatizabilityAdminService.getWorkspaceThreatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeThreatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ThreatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_threatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported threatizability admin action.',
      })
    }

    return this.threatizabilityAdminService.executeThreatizabilityAdminAction(
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
