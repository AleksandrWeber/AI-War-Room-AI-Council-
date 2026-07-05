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
import { CompactionizabilityAdminService } from './compactionizability-admin.service.js'

type CompactionizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('compactionizability')
export class CompactionizabilityController {
  constructor(
    private readonly compactionizabilityAdminService: CompactionizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.compactionizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCompactionizabilityRollout() {
    return this.compactionizabilityAdminService.getCompactionizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCompactionizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.compactionizabilityAdminService.getWorkspaceCompactionizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCompactionizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CompactionizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_compactionizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported compactionizability admin action.',
      })
    }

    return this.compactionizabilityAdminService.executeCompactionizabilityAdminAction(
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
