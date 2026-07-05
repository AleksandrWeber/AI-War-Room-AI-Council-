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
import { EfficiencyAdminService } from './efficiency-admin.service.js'

type EfficiencyAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('efficiency')
export class EfficiencyController {
  constructor(
    private readonly efficiencyAdminService: EfficiencyAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.efficiencyAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEfficiencyRollout() {
    return this.efficiencyAdminService.getEfficiencyRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEfficiencyAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.efficiencyAdminService.getWorkspaceEfficiencyAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEfficiencyAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EfficiencyAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_efficiency_summary') {
      throw new BadRequestException({
        message: 'Unsupported efficiency admin action.',
      })
    }

    return this.efficiencyAdminService.executeEfficiencyAdminAction(
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
