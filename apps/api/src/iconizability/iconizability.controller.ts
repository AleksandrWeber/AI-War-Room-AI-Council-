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
import { IconizabilityAdminService } from './iconizability-admin.service.js'

type IconizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('iconizability')
export class IconizabilityController {
  constructor(
    private readonly iconizabilityAdminService: IconizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.iconizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIconizabilityRollout() {
    return this.iconizabilityAdminService.getIconizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIconizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.iconizabilityAdminService.getWorkspaceIconizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIconizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IconizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_iconizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported iconizability admin action.',
      })
    }

    return this.iconizabilityAdminService.executeIconizabilityAdminAction(
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
