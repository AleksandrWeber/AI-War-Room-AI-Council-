import type {
  ProvisionExternalMemberInput,
  ProvisionExternalMemberResult,
  WorkspaceMemberRecord,
  WorkspaceMembershipRecord,
  WorkspaceRepository,
} from './workspace.repository.js'

export class InMemoryWorkspaceRepository implements WorkspaceRepository {
  private readonly userProfiles = new Map<
    string,
    { email: string | null; displayName: string | null }
  >([
    ['user_local', { email: 'local@ai-war-room.dev', displayName: 'Local Developer' }],
    ['user_test', { email: 'test@ai-war-room.dev', displayName: 'Test User' }],
    ['user_admin', { email: 'admin@ai-war-room.dev', displayName: 'Admin User' }],
    ['user_member', { email: 'member@ai-war-room.dev', displayName: 'Member User' }],
  ])
  private readonly memberships = new Map<string, WorkspaceMembershipRecord>([
    [
      'user_local:local_workspace',
      {
        userId: 'user_local',
        workspaceId: 'local_workspace',
        role: 'owner',
      },
    ],
    [
      'user_test:workspace_1',
      {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
    ],
    [
      'user_admin:workspace_1',
      {
        userId: 'user_admin',
        workspaceId: 'workspace_1',
        role: 'admin',
      },
    ],
    [
      'user_member:workspace_1',
      {
        userId: 'user_member',
        workspaceId: 'workspace_1',
        role: 'member',
      },
    ],
    [
      'user_test:workspace_tiny_quota',
      {
        userId: 'user_test',
        workspaceId: 'workspace_tiny_quota',
        role: 'owner',
      },
    ],
    [
      'user_test:workspace_pro',
      {
        userId: 'user_test',
        workspaceId: 'workspace_pro',
        role: 'owner',
      },
    ],
  ])

  private readonly users = new Set<string>(['user_local', 'user_test'])
  private readonly workspaces = new Set<string>([
    'local_workspace',
    'workspace_1',
    'workspace_tiny_quota',
    'workspace_pro',
  ])

  async findMembership(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceMembershipRecord | null> {
    return this.memberships.get(`${userId}:${workspaceId}`) ?? null
  }

  async provisionExternalMember(
    input: ProvisionExternalMemberInput,
  ): Promise<ProvisionExternalMemberResult> {
    const actions: ProvisionExternalMemberResult['actions'] = []
    const userExists = this.users.has(input.userId)

    if (userExists) {
      actions.push('updated_user')
    } else {
      this.users.add(input.userId)
      actions.push('created_user')
    }

    const workspaceExists = this.workspaces.has(input.workspaceId)

    if (!workspaceExists) {
      this.workspaces.add(input.workspaceId)
      actions.push('created_workspace')
    }

    const membershipKey = `${input.userId}:${input.workspaceId}`
    const existingMembership = this.memberships.get(membershipKey)

    if (!existingMembership) {
      const membership: WorkspaceMembershipRecord = {
        userId: input.userId,
        workspaceId: input.workspaceId,
        role: workspaceExists ? 'member' : 'owner',
      }

      this.memberships.set(membershipKey, membership)
      actions.push('created_membership')

      return {
        ...membership,
        actions,
      }
    }

    return {
      ...existingMembership,
      actions,
    }
  }

  async listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberRecord[]> {
    return [...this.memberships.values()]
      .filter((membership) => membership.workspaceId === workspaceId)
      .map((membership) => this.toMemberRecord(membership))
      .sort((left, right) => left.userId.localeCompare(right.userId))
  }

  async updateMemberRole(input: {
    workspaceId: string
    userId: string
    role: WorkspaceMembershipRecord['role']
  }): Promise<WorkspaceMemberRecord | null> {
    const key = `${input.userId}:${input.workspaceId}`
    const existing = this.memberships.get(key)

    if (!existing) {
      return null
    }

    const updated = {
      ...existing,
      role: input.role,
    }
    this.memberships.set(key, updated)

    return this.toMemberRecord(updated)
  }

  async removeMember(input: {
    workspaceId: string
    userId: string
  }): Promise<boolean> {
    return this.memberships.delete(`${input.userId}:${input.workspaceId}`)
  }

  async addWorkspaceMember(input: {
    workspaceId: string
    userId: string
    role: WorkspaceMembershipRecord['role']
    email?: string
    displayName?: string
  }): Promise<WorkspaceMemberRecord> {
    this.users.add(input.userId)
    this.workspaces.add(input.workspaceId)
    this.userProfiles.set(input.userId, {
      email: input.email ?? null,
      displayName: input.displayName ?? input.userId,
    })

    const membership: WorkspaceMembershipRecord = {
      workspaceId: input.workspaceId,
      userId: input.userId,
      role: input.role,
    }
    this.memberships.set(`${input.userId}:${input.workspaceId}`, membership)

    return this.toMemberRecord(membership)
  }

  private toMemberRecord(
    membership: WorkspaceMembershipRecord,
  ): WorkspaceMemberRecord {
    const profile = this.userProfiles.get(membership.userId)

    return {
      ...membership,
      email: profile?.email ?? null,
      displayName: profile?.displayName ?? null,
    }
  }
}
