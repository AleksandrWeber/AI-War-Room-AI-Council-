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
import { RemediationizabilityAdminService } from './remediationizability-admin.service.js'

type RemediationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('remediationizability')
export class RemediationizabilityController {
  constructor(
    private readonly remediationizabilityAdminService: RemediationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.remediationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRemediationizabilityRollout() {
    return this.remediationizabilityAdminService.getRemediationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRemediationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.remediationizabilityAdminService.getWorkspaceRemediationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRemediationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RemediationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_remediationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported remediationizability admin action.',
      })
    }

    return this.remediationizabilityAdminService.executeRemediationizabilityAdminAction(
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
