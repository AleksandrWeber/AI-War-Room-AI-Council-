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
import { BalancingizabilityAdminService } from './balancingizability-admin.service.js'

type BalancingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('balancingizability')
export class BalancingizabilityController {
  constructor(
    private readonly balancingizabilityAdminService: BalancingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.balancingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBalancingizabilityRollout() {
    return this.balancingizabilityAdminService.getBalancingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBalancingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.balancingizabilityAdminService.getWorkspaceBalancingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBalancingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BalancingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_balancingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported balancingizability admin action.',
      })
    }

    return this.balancingizabilityAdminService.executeBalancingizabilityAdminAction(
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
