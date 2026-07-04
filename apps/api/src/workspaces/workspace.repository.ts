import type { AuthContext, WorkspaceRole } from '@ai-war-room/schemas'

export const WORKSPACE_REPOSITORY = Symbol('WORKSPACE_REPOSITORY')

export type WorkspaceMembershipRecord = {
  workspaceId: string
  userId: string
  role: WorkspaceRole
}

export interface WorkspaceRepository {
  findMembership(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceMembershipRecord | null>
}

export function toAuthContext(
  membership: WorkspaceMembershipRecord,
): AuthContext {
  return {
    userId: membership.userId,
    workspaceId: membership.workspaceId,
    role: membership.role,
  }
}
