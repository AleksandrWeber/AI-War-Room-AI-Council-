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
import { ResilienceAdminService } from './resilience-admin.service.js'

type ResilienceAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('resilience')
export class ResilienceController {
  constructor(private readonly resilienceAdminService: ResilienceAdminService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.resilienceAdminService.getCapabilities()
  }

  @Get('readiness')
  async getResilienceRollout() {
    return this.resilienceAdminService.getResilienceRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceResilienceAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.resilienceAdminService.getWorkspaceResilienceAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeResilienceAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ResilienceAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_resilience_summary') {
      throw new BadRequestException({
        message: 'Unsupported resilience admin action.',
      })
    }

    return this.resilienceAdminService.executeResilienceAdminAction(
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
