import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import {
  createWorkspaceRequestSchema,
  createWorkspaceResponseSchema,
  leaveWorkspaceResponseSchema,
  listMyWorkspacesResponseSchema,
  type AuthContext,
  type ExternalAuthIdentity,
} from '@ai-war-room/schemas'
import {
  WORKSPACE_REPOSITORY,
  toAuthContext,
  type WorkspaceRepository,
} from './workspace.repository.js'
import { UserProvisioningService } from './user-provisioning.service.js'
import { assertOwnerCountSafe } from './workspace-member-admin.helpers.js'

@Injectable()
export class WorkspaceService {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly userProvisioningService: UserProvisioningService,
  ) {}

  async ensureExternalAccess(
    identity: ExternalAuthIdentity,
    workspaceId: string,
  ) {
    if (!this.userProvisioningService.isAutoProvisionEnabled()) {
      return
    }

    await this.userProvisioningService.provisionExternalMember({
      userId: identity.userId,
      workspaceId,
      email: identity.email,
      displayName: identity.subject,
    })
  }

  async requireMembership(input: {
    userId: string
    workspaceId: string
  }): Promise<AuthContext> {
    const membership = await this.workspaceRepository.findMembership(
      input.userId,
      input.workspaceId,
    )

    if (!membership) {
      throw new ForbiddenException({
        message: 'User is not a member of this workspace.',
      })
    }

    return toAuthContext(membership)
  }

  async listMyWorkspaces(userId: string) {
    const memberships =
      await this.workspaceRepository.listMembershipsForUser(userId)
    const workspaces = []

    for (const membership of memberships) {
      const workspace = await this.workspaceRepository.getWorkspace(
        membership.workspaceId,
      )
      workspaces.push({
        workspaceId: membership.workspaceId,
        name: workspace?.name ?? membership.workspaceId,
        role: membership.role,
      })
    }

    workspaces.sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }),
    )

    return listMyWorkspacesResponseSchema.parse({
      userId,
      workspaces,
    })
  }

  async createWorkspace(input: { userId: string; body: unknown }) {
    const parsed = createWorkspaceRequestSchema.safeParse(input.body)
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid create workspace request.',
        issues: parsed.error.issues,
      })
    }

    const workspaceId = `workspace_${randomUUID()}`
    const created = await this.workspaceRepository.createWorkspace({
      workspaceId,
      name: parsed.data.name.trim(),
      ownerUserId: input.userId,
    })

    return createWorkspaceResponseSchema.parse({
      workspace: {
        workspaceId: created.workspaceId,
        name: created.name,
        role: 'owner',
      },
      guidance: 'Workspace created. You are the owner.',
    })
  }

  async leaveWorkspace(input: {
    authContext: AuthContext
    workspaceId: string
  }) {
    if (input.authContext.workspaceId !== input.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const members = await this.workspaceRepository.listWorkspaceMembers(
      input.workspaceId,
    )
    const membership = members.find(
      (member) => member.userId === input.authContext.userId,
    )

    if (!membership) {
      throw new NotFoundException({
        message: 'You are not a member of this workspace.',
      })
    }

    try {
      assertOwnerCountSafe({
        members,
        targetUserId: input.authContext.userId,
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
      workspaceId: input.workspaceId,
      userId: input.authContext.userId,
    })

    if (!removed) {
      throw new NotFoundException({
        message: 'You are not a member of this workspace.',
      })
    }

    return leaveWorkspaceResponseSchema.parse({
      workspaceId: input.workspaceId,
      guidance: 'You left the workspace. Membership has been removed.',
    })
  }
}
