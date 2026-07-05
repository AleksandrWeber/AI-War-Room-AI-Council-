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
import { WalizabilityAdminService } from './walizability-admin.service.js'

type WalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('walizability')
export class WalizabilityController {
  constructor(
    private readonly walizabilityAdminService: WalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.walizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getWalizabilityRollout() {
    return this.walizabilityAdminService.getWalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceWalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.walizabilityAdminService.getWorkspaceWalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeWalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: WalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_walizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported walizability admin action.',
      })
    }

    return this.walizabilityAdminService.executeWalizabilityAdminAction(
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
