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
import { CheckpointizabilityAdminService } from './checkpointizability-admin.service.js'

type CheckpointizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('checkpointizability')
export class CheckpointizabilityController {
  constructor(
    private readonly checkpointizabilityAdminService: CheckpointizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.checkpointizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCheckpointizabilityRollout() {
    return this.checkpointizabilityAdminService.getCheckpointizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCheckpointizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.checkpointizabilityAdminService.getWorkspaceCheckpointizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCheckpointizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CheckpointizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_checkpointizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported checkpointizability admin action.',
      })
    }

    return this.checkpointizabilityAdminService.executeCheckpointizabilityAdminAction(
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
