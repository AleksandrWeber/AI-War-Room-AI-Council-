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
import { SequencizabilityAdminService } from './sequencizability-admin.service.js'

type SequencizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('sequencizability')
export class SequencizabilityController {
  constructor(
    private readonly sequencizabilityAdminService: SequencizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.sequencizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSequencizabilityRollout() {
    return this.sequencizabilityAdminService.getSequencizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSequencizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.sequencizabilityAdminService.getWorkspaceSequencizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSequencizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SequencizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_sequencizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported sequencizability admin action.',
      })
    }

    return this.sequencizabilityAdminService.executeSequencizabilityAdminAction(
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
