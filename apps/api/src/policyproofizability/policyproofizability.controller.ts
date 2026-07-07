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
import { PolicyproofizabilityAdminService } from './policyproofizability-admin.service.js'

type PolicyproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('policyproofizability')
export class PolicyproofizabilityController {
  constructor(
    private readonly policyproofizabilityAdminService: PolicyproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.policyproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPolicyproofizabilityRollout() {
    return this.policyproofizabilityAdminService.getPolicyproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePolicyproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.policyproofizabilityAdminService.getWorkspacePolicyproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePolicyproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PolicyproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_policyproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported policyproofizability admin action.',
      })
    }

    return this.policyproofizabilityAdminService.executePolicyproofizabilityAdminAction(
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
