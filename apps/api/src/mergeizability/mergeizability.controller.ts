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
import { MergeizabilityAdminService } from './mergeizability-admin.service.js'

type MergeizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('mergeizability')
export class MergeizabilityController {
  constructor(
    private readonly mergeizabilityAdminService: MergeizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.mergeizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMergeizabilityRollout() {
    return this.mergeizabilityAdminService.getMergeizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMergeizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.mergeizabilityAdminService.getWorkspaceMergeizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMergeizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MergeizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_mergeizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported mergeizability admin action.',
      })
    }

    return this.mergeizabilityAdminService.executeMergeizabilityAdminAction(
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
