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
import { UtilizationAdminService } from './utilization-admin.service.js'

type UtilizationAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('utilization')
export class UtilizationController {
  constructor(
    private readonly utilizationAdminService: UtilizationAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.utilizationAdminService.getCapabilities()
  }

  @Get('readiness')
  async getUtilizationRollout() {
    return this.utilizationAdminService.getUtilizationRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceUtilizationAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.utilizationAdminService.getWorkspaceUtilizationAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeUtilizationAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: UtilizationAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_utilization_summary') {
      throw new BadRequestException({
        message: 'Unsupported utilization admin action.',
      })
    }

    return this.utilizationAdminService.executeUtilizationAdminAction(
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
