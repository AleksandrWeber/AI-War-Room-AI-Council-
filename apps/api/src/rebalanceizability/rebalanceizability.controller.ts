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
import { RebalanceizabilityAdminService } from './rebalanceizability-admin.service.js'

type RebalanceizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('rebalanceizability')
export class RebalanceizabilityController {
  constructor(
    private readonly rebalanceizabilityAdminService: RebalanceizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.rebalanceizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRebalanceizabilityRollout() {
    return this.rebalanceizabilityAdminService.getRebalanceizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRebalanceizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.rebalanceizabilityAdminService.getWorkspaceRebalanceizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRebalanceizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RebalanceizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_rebalanceizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported rebalanceizability admin action.',
      })
    }

    return this.rebalanceizabilityAdminService.executeRebalanceizabilityAdminAction(
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
