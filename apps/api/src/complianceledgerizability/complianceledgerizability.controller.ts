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
import { ComplianceledgerizabilityAdminService } from './complianceledgerizability-admin.service.js'

type ComplianceledgerizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('complianceledgerizability')
export class ComplianceledgerizabilityController {
  constructor(
    private readonly complianceledgerizabilityAdminService: ComplianceledgerizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.complianceledgerizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getComplianceledgerizabilityRollout() {
    return this.complianceledgerizabilityAdminService.getComplianceledgerizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceComplianceledgerizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.complianceledgerizabilityAdminService.getWorkspaceComplianceledgerizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeComplianceledgerizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ComplianceledgerizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_complianceledgerizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported complianceledgerizability admin action.',
      })
    }

    return this.complianceledgerizabilityAdminService.executeComplianceledgerizabilityAdminAction(
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
