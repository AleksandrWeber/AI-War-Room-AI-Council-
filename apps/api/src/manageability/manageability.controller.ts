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
import { ManageabilityAdminService } from './manageability-admin.service.js'

type ManageabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('manageability')
export class ManageabilityController {
  constructor(
    private readonly manageabilityAdminService: ManageabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.manageabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getManageabilityRollout() {
    return this.manageabilityAdminService.getManageabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceManageabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.manageabilityAdminService.getWorkspaceManageabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeManageabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ManageabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_manageability_summary') {
      throw new BadRequestException({
        message: 'Unsupported manageability admin action.',
      })
    }

    return this.manageabilityAdminService.executeManageabilityAdminAction(
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
