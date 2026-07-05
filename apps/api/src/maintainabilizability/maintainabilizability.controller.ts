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
import { MaintainabilizabilityAdminService } from './maintainabilizability-admin.service.js'

type MaintainabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('maintainabilizability')
export class MaintainabilizabilityController {
  constructor(
    private readonly maintainabilizabilityAdminService: MaintainabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.maintainabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMaintainabilizabilityRollout() {
    return this.maintainabilizabilityAdminService.getMaintainabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMaintainabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.maintainabilizabilityAdminService.getWorkspaceMaintainabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMaintainabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MaintainabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_maintainabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported maintainabilizability admin action.',
      })
    }

    return this.maintainabilizabilityAdminService.executeMaintainabilizabilityAdminAction(
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
