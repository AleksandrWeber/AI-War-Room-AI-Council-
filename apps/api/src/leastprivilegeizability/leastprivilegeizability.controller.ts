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
import { LeastprivilegeizabilityAdminService } from './leastprivilegeizability-admin.service.js'

type LeastprivilegeizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('leastprivilegeizability')
export class LeastprivilegeizabilityController {
  constructor(
    private readonly leastprivilegeizabilityAdminService: LeastprivilegeizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.leastprivilegeizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getLeastprivilegeizabilityRollout() {
    return this.leastprivilegeizabilityAdminService.getLeastprivilegeizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceLeastprivilegeizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.leastprivilegeizabilityAdminService.getWorkspaceLeastprivilegeizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeLeastprivilegeizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: LeastprivilegeizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_leastprivilegeizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported leastprivilegeizability admin action.',
      })
    }

    return this.leastprivilegeizabilityAdminService.executeLeastprivilegeizabilityAdminAction(
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
