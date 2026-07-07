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
import { ComplianceizabilityAdminService } from './complianceizability-admin.service.js'

type ComplianceizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('complianceizability')
export class ComplianceizabilityController {
  constructor(
    private readonly complianceizabilityAdminService: ComplianceizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.complianceizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getComplianceizabilityRollout() {
    return this.complianceizabilityAdminService.getComplianceizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceComplianceizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.complianceizabilityAdminService.getWorkspaceComplianceizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeComplianceizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ComplianceizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_complianceizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported complianceizability admin action.',
      })
    }

    return this.complianceizabilityAdminService.executeComplianceizabilityAdminAction(
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
