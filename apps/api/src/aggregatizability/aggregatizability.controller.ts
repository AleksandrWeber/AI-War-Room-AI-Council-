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
import { AggregatizabilityAdminService } from './aggregatizability-admin.service.js'

type AggregatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('aggregatizability')
export class AggregatizabilityController {
  constructor(
    private readonly aggregatizabilityAdminService: AggregatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.aggregatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAggregatizabilityRollout() {
    return this.aggregatizabilityAdminService.getAggregatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAggregatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.aggregatizabilityAdminService.getWorkspaceAggregatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAggregatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AggregatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_aggregatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported aggregatizability admin action.',
      })
    }

    return this.aggregatizabilityAdminService.executeAggregatizabilityAdminAction(
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
