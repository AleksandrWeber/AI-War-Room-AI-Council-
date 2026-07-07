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
import { PolicyizabilityAdminService } from './policyizability-admin.service.js'

type PolicyizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('policyizability')
export class PolicyizabilityController {
  constructor(
    private readonly policyizabilityAdminService: PolicyizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.policyizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPolicyizabilityRollout() {
    return this.policyizabilityAdminService.getPolicyizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePolicyizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.policyizabilityAdminService.getWorkspacePolicyizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePolicyizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PolicyizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_policyizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported policyizability admin action.',
      })
    }

    return this.policyizabilityAdminService.executePolicyizabilityAdminAction(
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
