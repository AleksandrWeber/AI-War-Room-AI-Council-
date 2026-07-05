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
import { ReplicabilizabilityAdminService } from './replicabilizability-admin.service.js'

type ReplicabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('replicabilizability')
export class ReplicabilizabilityController {
  constructor(
    private readonly replicabilizabilityAdminService: ReplicabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.replicabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReplicabilizabilityRollout() {
    return this.replicabilizabilityAdminService.getReplicabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReplicabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.replicabilizabilityAdminService.getWorkspaceReplicabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReplicabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReplicabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_replicabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported replicabilizability admin action.',
      })
    }

    return this.replicabilizabilityAdminService.executeReplicabilizabilityAdminAction(
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
