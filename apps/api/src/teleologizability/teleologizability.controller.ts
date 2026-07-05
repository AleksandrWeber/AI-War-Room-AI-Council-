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
import { TeleologizabilityAdminService } from './teleologizability-admin.service.js'

type TeleologizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('teleologizability')
export class TeleologizabilityController {
  constructor(
    private readonly teleologizabilityAdminService: TeleologizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.teleologizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTeleologizabilityRollout() {
    return this.teleologizabilityAdminService.getTeleologizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTeleologizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.teleologizabilityAdminService.getWorkspaceTeleologizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTeleologizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TeleologizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_teleologizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported teleologizability admin action.',
      })
    }

    return this.teleologizabilityAdminService.executeTeleologizabilityAdminAction(
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
