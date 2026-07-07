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
import { PermissionizabilityAdminService } from './permissionizability-admin.service.js'

type PermissionizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('permissionizability')
export class PermissionizabilityController {
  constructor(
    private readonly permissionizabilityAdminService: PermissionizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.permissionizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPermissionizabilityRollout() {
    return this.permissionizabilityAdminService.getPermissionizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePermissionizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.permissionizabilityAdminService.getWorkspacePermissionizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePermissionizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PermissionizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_permissionizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported permissionizability admin action.',
      })
    }

    return this.permissionizabilityAdminService.executePermissionizabilityAdminAction(
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
