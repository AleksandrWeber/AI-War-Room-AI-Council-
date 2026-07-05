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
import { SchedulabilityAdminService } from './schedulability-admin.service.js'

type SchedulabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('schedulability')
export class SchedulabilityController {
  constructor(
    private readonly schedulabilityAdminService: SchedulabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.schedulabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSchedulabilityRollout() {
    return this.schedulabilityAdminService.getSchedulabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSchedulabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.schedulabilityAdminService.getWorkspaceSchedulabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSchedulabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SchedulabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_schedulability_summary') {
      throw new BadRequestException({
        message: 'Unsupported schedulability admin action.',
      })
    }

    return this.schedulabilityAdminService.executeSchedulabilityAdminAction(
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
