import type { AuthContext, WorkspaceRole } from '@ai-war-room/schemas'
import type { UserProvisioningAction } from '@ai-war-room/schemas'

export const WORKSPACE_REPOSITORY = Symbol('WORKSPACE_REPOSITORY')

export type WorkspaceMembershipRecord = {
  workspaceId: string
  userId: string
  role: WorkspaceRole
}

export type ProvisionExternalMemberInput = {
  userId: string
  workspaceId: string
  email?: string
  displayName?: string
}

export type ProvisionExternalMemberResult = WorkspaceMembershipRecord & {
  actions: UserProvisioningAction[]
}

export interface WorkspaceRepository {
  findMembership(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceMembershipRecord | null>

  provisionExternalMember(
    input: ProvisionExternalMemberInput,
  ): Promise<ProvisionExternalMemberResult>
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
