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
import { SubscribizabilityAdminService } from './subscribizability-admin.service.js'

type SubscribizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('subscribizability')
export class SubscribizabilityController {
  constructor(
    private readonly subscribizabilityAdminService: SubscribizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.subscribizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSubscribizabilityRollout() {
    return this.subscribizabilityAdminService.getSubscribizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSubscribizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.subscribizabilityAdminService.getWorkspaceSubscribizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSubscribizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SubscribizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_subscribizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported subscribizability admin action.',
      })
    }

    return this.subscribizabilityAdminService.executeSubscribizabilityAdminAction(
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
