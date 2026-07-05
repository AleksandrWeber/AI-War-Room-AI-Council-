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
import { AlertabilizabilityAdminService } from './alertabilizability-admin.service.js'

type AlertabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('alertabilizability')
export class AlertabilizabilityController {
  constructor(
    private readonly alertabilizabilityAdminService: AlertabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.alertabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAlertabilizabilityRollout() {
    return this.alertabilizabilityAdminService.getAlertabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAlertabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.alertabilizabilityAdminService.getWorkspaceAlertabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAlertabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AlertabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_alertabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported alertabilizability admin action.',
      })
    }

    return this.alertabilizabilityAdminService.executeAlertabilizabilityAdminAction(
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
