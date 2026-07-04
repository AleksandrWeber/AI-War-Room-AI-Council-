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
import { WorkspaceAdminService } from './workspace-admin.service.js'

type WorkspaceMemberAdminBody = {
  workspaceId?: unknown
  action?: unknown
  userId?: unknown
  role?: unknown
  email?: unknown
  displayName?: unknown
}

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspaceAdminService: WorkspaceAdminService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.workspaceAdminService.getCapabilities()
  }

  @Get(':workspaceId/admin/members')
  @UseGuards(WorkspaceAccessGuard)
  getWorkspaceMemberAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.workspaceAdminService.getWorkspaceMemberAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post(':workspaceId/admin/members/actions')
  @UseGuards(WorkspaceAccessGuard)
  executeWorkspaceMemberAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: WorkspaceMemberAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action
    const userId = typeof body.userId === 'string' ? body.userId : ''
    const role =
      body.role === 'owner' ||
      body.role === 'admin' ||
      body.role === 'member' ||
      body.role === 'viewer'
        ? body.role
        : undefined

    if (
      action !== 'update_member_role' &&
      action !== 'remove_member' &&
      action !== 'add_member'
    ) {
      throw new BadRequestException({
        message: 'Unsupported workspace member admin action.',
      })
    }

    if (!userId) {
      throw new BadRequestException({
        message: 'userId is required for workspace member admin actions.',
      })
    }

    return this.workspaceAdminService.executeWorkspaceMemberAdminAction(
      request.authContext!,
      {
        workspaceId,
        action,
        userId,
        role,
        email: typeof body.email === 'string' ? body.email : undefined,
        displayName:
          typeof body.displayName === 'string' ? body.displayName : undefined,
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
