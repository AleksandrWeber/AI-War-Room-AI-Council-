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
import { GovernancetrackizabilityAdminService } from './governancetrackizability-admin.service.js'

type GovernancetrackizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('governancetrackizability')
export class GovernancetrackizabilityController {
  constructor(
    private readonly governancetrackizabilityAdminService: GovernancetrackizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.governancetrackizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getGovernancetrackizabilityRollout() {
    return this.governancetrackizabilityAdminService.getGovernancetrackizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceGovernancetrackizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.governancetrackizabilityAdminService.getWorkspaceGovernancetrackizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeGovernancetrackizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: GovernancetrackizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_governancetrackizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported governancetrackizability admin action.',
      })
    }

    return this.governancetrackizabilityAdminService.executeGovernancetrackizabilityAdminAction(
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
