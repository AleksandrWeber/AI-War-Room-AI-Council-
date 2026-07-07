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
import { CompliancechainizabilityAdminService } from './compliancechainizability-admin.service.js'

type CompliancechainizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('compliancechainizability')
export class CompliancechainizabilityController {
  constructor(
    private readonly compliancechainizabilityAdminService: CompliancechainizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.compliancechainizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCompliancechainizabilityRollout() {
    return this.compliancechainizabilityAdminService.getCompliancechainizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCompliancechainizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.compliancechainizabilityAdminService.getWorkspaceCompliancechainizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCompliancechainizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CompliancechainizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_compliancechainizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported compliancechainizability admin action.',
      })
    }

    return this.compliancechainizabilityAdminService.executeCompliancechainizabilityAdminAction(
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
