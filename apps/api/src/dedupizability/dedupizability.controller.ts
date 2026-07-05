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
import { DedupizabilityAdminService } from './dedupizability-admin.service.js'

type DedupizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('dedupizability')
export class DedupizabilityController {
  constructor(
    private readonly dedupizabilityAdminService: DedupizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.dedupizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDedupizabilityRollout() {
    return this.dedupizabilityAdminService.getDedupizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDedupizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.dedupizabilityAdminService.getWorkspaceDedupizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDedupizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DedupizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_dedupizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported dedupizability admin action.',
      })
    }

    return this.dedupizabilityAdminService.executeDedupizabilityAdminAction(
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
