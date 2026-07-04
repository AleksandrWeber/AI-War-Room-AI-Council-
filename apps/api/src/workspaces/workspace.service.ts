import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import type { AuthContext } from '@ai-war-room/schemas'
import {
  WORKSPACE_REPOSITORY,
  toAuthContext,
  type WorkspaceRepository,
} from './workspace.repository.js'

@Injectable()
export class WorkspaceService {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

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
