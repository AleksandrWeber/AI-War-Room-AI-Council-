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
import { ComplianceguardizabilityAdminService } from './complianceguardizability-admin.service.js'

type ComplianceguardizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('complianceguardizability')
export class ComplianceguardizabilityController {
  constructor(
    private readonly complianceguardizabilityAdminService: ComplianceguardizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.complianceguardizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getComplianceguardizabilityRollout() {
    return this.complianceguardizabilityAdminService.getComplianceguardizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceComplianceguardizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.complianceguardizabilityAdminService.getWorkspaceComplianceguardizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeComplianceguardizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ComplianceguardizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_complianceguardizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported complianceguardizability admin action.',
      })
    }

    return this.complianceguardizabilityAdminService.executeComplianceguardizabilityAdminAction(
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
