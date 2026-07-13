import {
  Body,
  Controller,
  BadRequestException,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import {
  type AuthenticatedRequest,
  WorkspaceAccessGuard,
} from '../auth/workspace-access.guard.js'
import { AuthService } from '../auth/auth.service.js'
import { WorkspaceAdminService } from './workspace-admin.service.js'
import { WorkspaceAuditService } from './workspace-audit.service.js'
import { WorkspaceInviteService } from './workspace-invite.service.js'
import { WorkspaceService } from './workspace.service.js'

type WorkspaceMemberAdminBody = {
  workspaceId?: unknown
  action?: unknown
  userId?: unknown
  role?: unknown
  email?: unknown
  displayName?: unknown
}

type WorkspaceSettingsAdminBody = {
  workspaceId?: unknown
  action?: unknown
  name?: unknown
  shieldDisplaySensitivity?: unknown
}

@Controller('workspaces')
export class WorkspacesController {
  constructor(
    private readonly authService: AuthService,
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceAdminService: WorkspaceAdminService,
    private readonly workspaceAuditService: WorkspaceAuditService,
    private readonly workspaceInviteService: WorkspaceInviteService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.workspaceAdminService.getCapabilities()
  }

  @Get('mine')
  async listMyWorkspaces(@Req() request: AuthenticatedRequest) {
    await this.authService.assertApiAccess(request)
    const authIdentity = this.authService.resolveAuthIdentity(request)
    const userId =
      authIdentity?.userId ??
      (Array.isArray(request.headers['x-user-id'])
        ? request.headers['x-user-id'][0]
        : request.headers['x-user-id'])

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new UnauthorizedException({
        message: 'Missing authenticated user for workspace listing.',
      })
    }

    return this.workspaceService.listMyWorkspaces(userId)
  }

  @Post('invites/accept')
  @UseGuards(WorkspaceAccessGuard)
  acceptWorkspaceInvite(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workspaceInviteService.acceptInvite({
      authContext: request.authContext!,
      body,
    })
  }

  @Get(':workspaceId/invites')
  @UseGuards(WorkspaceAccessGuard)
  listWorkspaceInvites(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.workspaceInviteService.listInvites({
      authContext: request.authContext!,
      workspaceId,
    })
  }

  @Post(':workspaceId/invites')
  @UseGuards(WorkspaceAccessGuard)
  createWorkspaceInvite(
    @Param('workspaceId') workspaceId: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.workspaceInviteService.createInvite({
      authContext: request.authContext!,
      workspaceId,
      body,
    })
  }

  @Post(':workspaceId/invites/:inviteId/revoke')
  @UseGuards(WorkspaceAccessGuard)
  revokeWorkspaceInvite(
    @Param('workspaceId') workspaceId: string,
    @Param('inviteId') inviteId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.workspaceInviteService.revokeInvite({
      authContext: request.authContext!,
      workspaceId,
      inviteId,
    })
  }

  @Post(':workspaceId/invites/:inviteId/resend')
  @UseGuards(WorkspaceAccessGuard)
  resendWorkspaceInvite(
    @Param('workspaceId') workspaceId: string,
    @Param('inviteId') inviteId: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.workspaceInviteService.resendInvite({
      authContext: request.authContext!,
      workspaceId,
      inviteId,
      body,
    })
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

  @Get(':workspaceId/admin/settings')
  @UseGuards(WorkspaceAccessGuard)
  getWorkspaceSettingsAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.workspaceAdminService.getWorkspaceSettingsAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post(':workspaceId/admin/settings/actions')
  @UseGuards(WorkspaceAccessGuard)
  executeWorkspaceSettingsAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: WorkspaceSettingsAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (
      action !== 'update_workspace_name' &&
      action !== 'reset_workspace_name' &&
      action !== 'update_shield_display_sensitivity'
    ) {
      throw new BadRequestException({
        message: 'Unsupported workspace settings admin action.',
      })
    }

    return this.workspaceAdminService.executeWorkspaceSettingsAdminAction(
      request.authContext!,
      {
        workspaceId,
        action,
        name: typeof body.name === 'string' ? body.name : undefined,
        shieldDisplaySensitivity:
          body.shieldDisplaySensitivity === 'high_only' ||
          body.shieldDisplaySensitivity === 'medium_and_up' ||
          body.shieldDisplaySensitivity === 'all'
            ? body.shieldDisplaySensitivity
            : undefined,
      },
    )
  }

  @Get(':workspaceId/admin/audit/export')
  @UseGuards(WorkspaceAccessGuard)
  async exportWorkspaceAudit(
    @Param('workspaceId') workspaceId: string,
    @Query('format') format: string | undefined,
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const exported = await this.workspaceAuditService.exportWorkspaceAudit(
      request.authContext!,
      workspaceId,
      format,
    )

    reply
      .header('Content-Type', exported.contentType)
      .header(
        'Content-Disposition',
        `attachment; filename="${exported.filename}"`,
      )
    reply.send(exported.body)
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
