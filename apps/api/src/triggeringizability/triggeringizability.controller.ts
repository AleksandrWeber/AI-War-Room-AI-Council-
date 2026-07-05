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
import { TriggeringizabilityAdminService } from './triggeringizability-admin.service.js'

type TriggeringizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('triggeringizability')
export class TriggeringizabilityController {
  constructor(
    private readonly triggeringizabilityAdminService: TriggeringizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.triggeringizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTriggeringizabilityRollout() {
    return this.triggeringizabilityAdminService.getTriggeringizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTriggeringizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.triggeringizabilityAdminService.getWorkspaceTriggeringizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTriggeringizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TriggeringizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_triggeringizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported triggeringizability admin action.',
      })
    }

    return this.triggeringizabilityAdminService.executeTriggeringizabilityAdminAction(
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
