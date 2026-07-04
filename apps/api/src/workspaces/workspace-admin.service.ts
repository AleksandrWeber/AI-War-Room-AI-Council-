import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  workspaceAdminCapabilitiesResponseSchema,
  workspaceMemberAdminActionRequestSchema,
  workspaceMemberAdminActionResponseSchema,
  workspaceMemberAdminSummaryResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  assertOwnerCountSafe,
  buildWorkspaceMemberAdminStats,
  getWorkspaceMemberAdminGuidance,
  resolveWorkspaceMemberAdminActions,
} from './workspace-member-admin.helpers.js'
import {
  WORKSPACE_REPOSITORY,
  type WorkspaceRepository,
} from './workspace.repository.js'

@Injectable()
export class WorkspaceAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  getCapabilities() {
    return workspaceAdminCapabilitiesResponseSchema.parse({
      supportsWorkspaceMemberAdminTools: true,
      guidance:
        'Workspace member admin tools are available to owners and admins.',
    })
  }

  async getWorkspaceMemberAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageWorkspaceMembers(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const members = await this.workspaceRepository.listWorkspaceMembers(
      workspaceId,
    )
    const availableActions = [
      ...resolveWorkspaceMemberAdminActions({
        nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      }),
    ]

    return workspaceMemberAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      members,
      stats: buildWorkspaceMemberAdminStats(members),
      availableActions,
      guidance: getWorkspaceMemberAdminGuidance({ availableActions }),
    })
  }

  async executeWorkspaceMemberAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'update_member_role' | 'remove_member' | 'add_member'
      userId: string
      role?: AuthContext['role']
      email?: string
      displayName?: string
    },
  ) {
    this.assertCanManageWorkspaceMembers(authContext)

    const payload = workspaceMemberAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
      userId: input.userId,
      role: input.role,
      email: input.email,
      displayName: input.displayName,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const members = await this.workspaceRepository.listWorkspaceMembers(
      payload.workspaceId,
    )

    switch (payload.action) {
      case 'update_member_role': {
        if (!payload.role) {
          throw new BadRequestException({
            message: 'role is required for update_member_role.',
          })
        }

        try {
          assertOwnerCountSafe({
            members,
            targetUserId: payload.userId,
            nextRole: payload.role,
          })
        } catch (error) {
          throw new BadRequestException({
            message:
              error instanceof Error
                ? error.message
                : 'Workspace must keep at least one owner.',
          })
        }

        const member = await this.workspaceRepository.updateMemberRole({
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          role: payload.role,
        })

        if (!member) {
          throw new NotFoundException({
            message: 'Workspace member was not found.',
          })
        }

        return workspaceMemberAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Updated ${member.userId} to ${member.role}.`,
          member,
        })
      }
      case 'remove_member': {
        try {
          assertOwnerCountSafe({
            members,
            targetUserId: payload.userId,
          })
        } catch (error) {
          throw new BadRequestException({
            message:
              error instanceof Error
                ? error.message
                : 'Workspace must keep at least one owner.',
          })
        }

        const removed = await this.workspaceRepository.removeMember({
          workspaceId: payload.workspaceId,
          userId: payload.userId,
        })

        if (!removed) {
          throw new NotFoundException({
            message: 'Workspace member was not found.',
          })
        }

        return workspaceMemberAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Removed ${payload.userId} from the workspace.`,
        })
      }
      case 'add_member': {
        if (this.configService.get('NODE_ENV', { infer: true }) === 'production') {
          throw new BadRequestException({
            message: 'Adding members through admin tools is not available in production.',
          })
        }

        if (!payload.role) {
          throw new BadRequestException({
            message: 'role is required for add_member.',
          })
        }

        const member = await this.workspaceRepository.addWorkspaceMember({
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          role: payload.role,
          email: payload.email,
          displayName: payload.displayName,
        })

        return workspaceMemberAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Added ${member.userId} as ${member.role}.`,
          member,
        })
      }
    }
  }

  private assertCanManageWorkspaceMembers(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message: 'Only workspace owners and admins can manage workspace members.',
    })
  }
}
