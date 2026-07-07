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
import { ComplianceproofizabilityAdminService } from './complianceproofizability-admin.service.js'

type ComplianceproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('complianceproofizability')
export class ComplianceproofizabilityController {
  constructor(
    private readonly complianceproofizabilityAdminService: ComplianceproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.complianceproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getComplianceproofizabilityRollout() {
    return this.complianceproofizabilityAdminService.getComplianceproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceComplianceproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.complianceproofizabilityAdminService.getWorkspaceComplianceproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeComplianceproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ComplianceproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_complianceproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported complianceproofizability admin action.',
      })
    }

    return this.complianceproofizabilityAdminService.executeComplianceproofizabilityAdminAction(
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
