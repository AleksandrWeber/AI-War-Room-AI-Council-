import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import {
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
}
