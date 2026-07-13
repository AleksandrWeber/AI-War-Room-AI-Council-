import type { AuthContext, WorkspaceRole } from '@ai-war-room/schemas'
import type { UserProvisioningAction } from '@ai-war-room/schemas'

export const WORKSPACE_REPOSITORY = Symbol('WORKSPACE_REPOSITORY')

export type WorkspaceMembershipRecord = {
  workspaceId: string
  userId: string
  role: WorkspaceRole
}

export type WorkspaceMemberRecord = WorkspaceMembershipRecord & {
  email: string | null
  displayName: string | null
}

export type WorkspaceRecord = {
  workspaceId: string
  name: string
  shieldDisplaySensitivity: 'high_only' | 'medium_and_up' | 'all'
  createdAt: string
  deletedAt: string | null
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

export type WorkspaceUserProfile = {
  email: string | null
  displayName: string | null
}

export interface WorkspaceRepository {
  findMembership(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceMembershipRecord | null>

  findUserProfile(userId: string): Promise<WorkspaceUserProfile | null>

  listMembershipsForUser(
    userId: string,
  ): Promise<WorkspaceMembershipRecord[]>

  createWorkspace(input: {
    workspaceId: string
    name: string
    ownerUserId: string
  }): Promise<WorkspaceRecord>

  provisionExternalMember(
    input: ProvisionExternalMemberInput,
  ): Promise<ProvisionExternalMemberResult>

  listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberRecord[]>

  updateMemberRole(input: {
    workspaceId: string
    userId: string
    role: WorkspaceRole
  }): Promise<WorkspaceMemberRecord | null>

  removeMember(input: {
    workspaceId: string
    userId: string
  }): Promise<boolean>

  addWorkspaceMember(input: {
    workspaceId: string
    userId: string
    role: WorkspaceRole
    email?: string
    displayName?: string
  }): Promise<WorkspaceMemberRecord>

  getWorkspace(workspaceId: string): Promise<WorkspaceRecord | null>

  softDeleteWorkspace(workspaceId: string): Promise<WorkspaceRecord | null>

  countActiveRuns(workspaceId: string): Promise<number>

  updateWorkspaceName(input: {
    workspaceId: string
    name: string
  }): Promise<WorkspaceRecord | null>

  updateShieldDisplaySensitivity(input: {
    workspaceId: string
    shieldDisplaySensitivity: WorkspaceRecord['shieldDisplaySensitivity']
  }): Promise<WorkspaceRecord | null>
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
