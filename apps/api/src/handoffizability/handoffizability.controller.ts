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
import { HandoffizabilityAdminService } from './handoffizability-admin.service.js'

type HandoffizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('handoffizability')
export class HandoffizabilityController {
  constructor(
    private readonly handoffizabilityAdminService: HandoffizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.handoffizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getHandoffizabilityRollout() {
    return this.handoffizabilityAdminService.getHandoffizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceHandoffizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.handoffizabilityAdminService.getWorkspaceHandoffizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeHandoffizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: HandoffizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_handoffizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported handoffizability admin action.',
      })
    }

    return this.handoffizabilityAdminService.executeHandoffizabilityAdminAction(
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
