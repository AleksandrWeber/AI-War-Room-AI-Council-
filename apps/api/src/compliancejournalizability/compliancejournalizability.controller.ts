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
import { CompliancejournalizabilityAdminService } from './compliancejournalizability-admin.service.js'

type CompliancejournalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('compliancejournalizability')
export class CompliancejournalizabilityController {
  constructor(
    private readonly compliancejournalizabilityAdminService: CompliancejournalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.compliancejournalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCompliancejournalizabilityRollout() {
    return this.compliancejournalizabilityAdminService.getCompliancejournalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCompliancejournalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.compliancejournalizabilityAdminService.getWorkspaceCompliancejournalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCompliancejournalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CompliancejournalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_compliancejournalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported compliancejournalizability admin action.',
      })
    }

    return this.compliancejournalizabilityAdminService.executeCompliancejournalizabilityAdminAction(
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
