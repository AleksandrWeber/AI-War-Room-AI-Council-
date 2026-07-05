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
import { DiscoverabilityAdminService } from './discoverability-admin.service.js'

type DiscoverabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('discoverability')
export class DiscoverabilityController {
  constructor(
    private readonly discoverabilityAdminService: DiscoverabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.discoverabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDiscoverabilityRollout() {
    return this.discoverabilityAdminService.getDiscoverabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDiscoverabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.discoverabilityAdminService.getWorkspaceDiscoverabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDiscoverabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DiscoverabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_discoverability_summary') {
      throw new BadRequestException({
        message: 'Unsupported discoverability admin action.',
      })
    }

    return this.discoverabilityAdminService.executeDiscoverabilityAdminAction(
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
