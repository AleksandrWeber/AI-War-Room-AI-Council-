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
import { WindowizabilityAdminService } from './windowizability-admin.service.js'

type WindowizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('windowizability')
export class WindowizabilityController {
  constructor(
    private readonly windowizabilityAdminService: WindowizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.windowizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getWindowizabilityRollout() {
    return this.windowizabilityAdminService.getWindowizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceWindowizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.windowizabilityAdminService.getWorkspaceWindowizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeWindowizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: WindowizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_windowizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported windowizability admin action.',
      })
    }

    return this.windowizabilityAdminService.executeWindowizabilityAdminAction(
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
