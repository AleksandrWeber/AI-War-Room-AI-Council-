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
import { MaintainabilityAdminService } from './maintainability-admin.service.js'

type MaintainabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('maintainability')
export class MaintainabilityController {
  constructor(
    private readonly maintainabilityAdminService: MaintainabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.maintainabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMaintainabilityRollout() {
    return this.maintainabilityAdminService.getMaintainabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMaintainabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.maintainabilityAdminService.getWorkspaceMaintainabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMaintainabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MaintainabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_maintainability_summary') {
      throw new BadRequestException({
        message: 'Unsupported maintainability admin action.',
      })
    }

    return this.maintainabilityAdminService.executeMaintainabilityAdminAction(
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
