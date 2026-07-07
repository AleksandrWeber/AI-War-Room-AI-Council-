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
import { CompliancevaultizabilityAdminService } from './compliancevaultizability-admin.service.js'

type CompliancevaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('compliancevaultizability')
export class CompliancevaultizabilityController {
  constructor(
    private readonly compliancevaultizabilityAdminService: CompliancevaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.compliancevaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCompliancevaultizabilityRollout() {
    return this.compliancevaultizabilityAdminService.getCompliancevaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCompliancevaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.compliancevaultizabilityAdminService.getWorkspaceCompliancevaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCompliancevaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CompliancevaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_compliancevaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported compliancevaultizability admin action.',
      })
    }

    return this.compliancevaultizabilityAdminService.executeCompliancevaultizabilityAdminAction(
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
