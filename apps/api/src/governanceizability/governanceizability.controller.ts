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
import { GovernanceizabilityAdminService } from './governanceizability-admin.service.js'

type GovernanceizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('governanceizability')
export class GovernanceizabilityController {
  constructor(
    private readonly governanceizabilityAdminService: GovernanceizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.governanceizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getGovernanceizabilityRollout() {
    return this.governanceizabilityAdminService.getGovernanceizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceGovernanceizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.governanceizabilityAdminService.getWorkspaceGovernanceizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeGovernanceizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: GovernanceizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_governanceizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported governanceizability admin action.',
      })
    }

    return this.governanceizabilityAdminService.executeGovernanceizabilityAdminAction(
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
