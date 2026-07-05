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
import { PerformanceAdminService } from './performance-admin.service.js'

type PerformanceAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('performance')
export class PerformanceController {
  constructor(
    private readonly performanceAdminService: PerformanceAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.performanceAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPerformanceRollout() {
    return this.performanceAdminService.getPerformanceRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePerformanceAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.performanceAdminService.getWorkspacePerformanceAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePerformanceAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PerformanceAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_performance_summary') {
      throw new BadRequestException({
        message: 'Unsupported performance admin action.',
      })
    }

    return this.performanceAdminService.executePerformanceAdminAction(
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
