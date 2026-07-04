import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import type { AuthContext, ExternalAuthIdentity } from '@ai-war-room/schemas'
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
}
