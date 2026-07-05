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
import { ComplianceAdminService } from './compliance-admin.service.js'

type ComplianceAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('compliance')
export class ComplianceController {
  constructor(
    private readonly complianceAdminService: ComplianceAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.complianceAdminService.getCapabilities()
  }

  @Get('readiness')
  async getComplianceRollout() {
    return this.complianceAdminService.getComplianceRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceComplianceAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.complianceAdminService.getWorkspaceComplianceAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeComplianceAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ComplianceAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_compliance_summary') {
      throw new BadRequestException({
        message: 'Unsupported compliance admin action.',
      })
    }

    return this.complianceAdminService.executeComplianceAdminAction(
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
