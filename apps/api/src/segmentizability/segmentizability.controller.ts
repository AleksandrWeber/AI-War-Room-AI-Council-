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
import { SegmentizabilityAdminService } from './segmentizability-admin.service.js'

type SegmentizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('segmentizability')
export class SegmentizabilityController {
  constructor(
    private readonly segmentizabilityAdminService: SegmentizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.segmentizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSegmentizabilityRollout() {
    return this.segmentizabilityAdminService.getSegmentizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSegmentizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.segmentizabilityAdminService.getWorkspaceSegmentizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSegmentizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SegmentizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_segmentizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported segmentizability admin action.',
      })
    }

    return this.segmentizabilityAdminService.executeSegmentizabilityAdminAction(
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
