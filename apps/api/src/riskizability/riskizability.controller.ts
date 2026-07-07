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
import { RiskizabilityAdminService } from './riskizability-admin.service.js'

type RiskizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('riskizability')
export class RiskizabilityController {
  constructor(
    private readonly riskizabilityAdminService: RiskizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.riskizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRiskizabilityRollout() {
    return this.riskizabilityAdminService.getRiskizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRiskizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.riskizabilityAdminService.getWorkspaceRiskizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRiskizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RiskizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_riskizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported riskizability admin action.',
      })
    }

    return this.riskizabilityAdminService.executeRiskizabilityAdminAction(
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
