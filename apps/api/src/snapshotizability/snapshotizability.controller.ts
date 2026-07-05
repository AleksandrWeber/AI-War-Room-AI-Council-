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
import { SnapshotizabilityAdminService } from './snapshotizability-admin.service.js'

type SnapshotizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('snapshotizability')
export class SnapshotizabilityController {
  constructor(
    private readonly snapshotizabilityAdminService: SnapshotizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.snapshotizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSnapshotizabilityRollout() {
    return this.snapshotizabilityAdminService.getSnapshotizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSnapshotizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.snapshotizabilityAdminService.getWorkspaceSnapshotizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSnapshotizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SnapshotizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_snapshotizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported snapshotizability admin action.',
      })
    }

    return this.snapshotizabilityAdminService.executeSnapshotizabilityAdminAction(
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
