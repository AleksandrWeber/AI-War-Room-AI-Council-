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
import { SystematizabilityAdminService } from './systematizability-admin.service.js'

type SystematizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('systematizability')
export class SystematizabilityController {
  constructor(
    private readonly systematizabilityAdminService: SystematizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.systematizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSystematizabilityRollout() {
    return this.systematizabilityAdminService.getSystematizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSystematizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.systematizabilityAdminService.getWorkspaceSystematizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSystematizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SystematizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_systematizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported systematizability admin action.',
      })
    }

    return this.systematizabilityAdminService.executeSystematizabilityAdminAction(
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
