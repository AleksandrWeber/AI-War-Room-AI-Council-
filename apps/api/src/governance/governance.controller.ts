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
import { GovernanceAdminService } from './governance-admin.service.js'

type GovernanceAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('governance')
export class GovernanceController {
  constructor(
    private readonly governanceAdminService: GovernanceAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.governanceAdminService.getCapabilities()
  }

  @Get('readiness')
  async getGovernanceRollout() {
    return this.governanceAdminService.getGovernanceRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceGovernanceAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.governanceAdminService.getWorkspaceGovernanceAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeGovernanceAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: GovernanceAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_governance_summary') {
      throw new BadRequestException({
        message: 'Unsupported governance admin action.',
      })
    }

    return this.governanceAdminService.executeGovernanceAdminAction(
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
