import type {
  ProvisionExternalMemberInput,
  ProvisionExternalMemberResult,
  WorkspaceMemberRecord,
  WorkspaceMembershipRecord,
  WorkspaceRecord,
  WorkspaceRepository,
  WorkspaceUserProfile,
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
      'user_local:secondary_workspace',
      {
        userId: 'user_local',
        workspaceId: 'secondary_workspace',
        role: 'member',
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
  private readonly workspaces = new Map<
    string,
    {
      name: string
      shieldDisplaySensitivity: WorkspaceRecord['shieldDisplaySensitivity']
      createdAt: string
      deletedAt: string | null
    }
  >([
    [
      'local_workspace',
      {
        name: 'Local Workspace',
        shieldDisplaySensitivity: 'medium_and_up',
        createdAt: '2026-07-04T12:00:00.000Z',
        deletedAt: null,
      },
    ],
    [
      'secondary_workspace',
      {
        name: 'Secondary Workspace',
        shieldDisplaySensitivity: 'medium_and_up',
        createdAt: '2026-07-04T12:00:00.000Z',
        deletedAt: null,
      },
    ],
    [
      'workspace_1',
      {
        name: 'Workspace One',
        shieldDisplaySensitivity: 'medium_and_up',
        createdAt: '2026-07-04T12:00:00.000Z',
        deletedAt: null,
      },
    ],
    [
      'workspace_tiny_quota',
      {
        name: 'Tiny Quota Workspace',
        shieldDisplaySensitivity: 'medium_and_up',
        createdAt: '2026-07-04T12:00:00.000Z',
        deletedAt: null,
      },
    ],
    [
      'workspace_pro',
      {
        name: 'Pro Workspace',
        shieldDisplaySensitivity: 'medium_and_up',
        createdAt: '2026-07-04T12:00:00.000Z',
        deletedAt: null,
      },
    ],
  ])
  private readonly activeRunCounts = new Map<string, number>()

  async findMembership(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceMembershipRecord | null> {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace || workspace.deletedAt) {
      return null
    }

    return this.memberships.get(`${userId}:${workspaceId}`) ?? null
  }

  async findUserProfile(userId: string): Promise<WorkspaceUserProfile | null> {
    const profile = this.userProfiles.get(userId)
    if (!profile) {
      return null
    }

    return {
      email: profile.email,
      displayName: profile.displayName,
    }
  }

  async listMembershipsForUser(
    userId: string,
  ): Promise<WorkspaceMembershipRecord[]> {
    return [...this.memberships.values()].filter((membership) => {
      if (membership.userId !== userId) {
        return false
      }
      const workspace = this.workspaces.get(membership.workspaceId)
      return Boolean(workspace && !workspace.deletedAt)
    })
  }

  async createWorkspace(input: {
    workspaceId: string
    name: string
    ownerUserId: string
  }): Promise<WorkspaceRecord> {
    if (this.workspaces.has(input.workspaceId)) {
      throw new Error(`Workspace ${input.workspaceId} already exists.`)
    }

    const createdAt = new Date().toISOString()
    this.workspaces.set(input.workspaceId, {
      name: input.name,
      shieldDisplaySensitivity: 'medium_and_up',
      createdAt,
      deletedAt: null,
    })
    this.users.add(input.ownerUserId)
    this.memberships.set(`${input.ownerUserId}:${input.workspaceId}`, {
      userId: input.ownerUserId,
      workspaceId: input.workspaceId,
      role: 'owner',
    })

    return {
      workspaceId: input.workspaceId,
      name: input.name,
      shieldDisplaySensitivity: 'medium_and_up',
      createdAt,
      deletedAt: null,
    }
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
      this.workspaces.set(input.workspaceId, {
        name: `Workspace ${input.workspaceId}`,
        shieldDisplaySensitivity: 'medium_and_up',
        createdAt: new Date().toISOString(),
        deletedAt: null,
      })
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
    if (!this.workspaces.has(input.workspaceId)) {
      this.workspaces.set(input.workspaceId, {
        name: `Workspace ${input.workspaceId}`,
        shieldDisplaySensitivity: 'medium_and_up',
        createdAt: new Date().toISOString(),
        deletedAt: null,
      })
    }
    const existingProfile = this.userProfiles.get(input.userId)
    this.userProfiles.set(input.userId, {
      email: input.email ?? existingProfile?.email ?? null,
      displayName:
        input.displayName ?? existingProfile?.displayName ?? input.userId,
    })

    const membership: WorkspaceMembershipRecord = {
      workspaceId: input.workspaceId,
      userId: input.userId,
      role: input.role,
    }
    this.memberships.set(`${input.userId}:${input.workspaceId}`, membership)

    return this.toMemberRecord(membership)
  }

  async getWorkspace(workspaceId: string): Promise<WorkspaceRecord | null> {
    const workspace = this.workspaces.get(workspaceId)

    if (!workspace || workspace.deletedAt) {
      return null
    }

    return {
      workspaceId,
      name: workspace.name,
      shieldDisplaySensitivity: workspace.shieldDisplaySensitivity,
      createdAt: workspace.createdAt,
      deletedAt: null,
    }
  }

  async softDeleteWorkspace(
    workspaceId: string,
  ): Promise<WorkspaceRecord | null> {
    const workspace = this.workspaces.get(workspaceId)

    if (!workspace || workspace.deletedAt) {
      return null
    }

    const deletedAt = new Date().toISOString()
    const updated = {
      ...workspace,
      deletedAt,
    }
    this.workspaces.set(workspaceId, updated)

    return {
      workspaceId,
      name: updated.name,
      shieldDisplaySensitivity: updated.shieldDisplaySensitivity,
      createdAt: updated.createdAt,
      deletedAt,
    }
  }

  async countActiveRuns(workspaceId: string): Promise<number> {
    return this.activeRunCounts.get(workspaceId) ?? 0
  }

  setActiveRunCount(workspaceId: string, count: number) {
    this.activeRunCounts.set(workspaceId, count)
  }

  async updateWorkspaceName(input: {
    workspaceId: string
    name: string
  }): Promise<WorkspaceRecord | null> {
    const workspace = this.workspaces.get(input.workspaceId)

    if (!workspace || workspace.deletedAt) {
      return null
    }

    const updated = {
      ...workspace,
      name: input.name,
    }
    this.workspaces.set(input.workspaceId, updated)

    return {
      workspaceId: input.workspaceId,
      name: updated.name,
      shieldDisplaySensitivity: updated.shieldDisplaySensitivity,
      createdAt: updated.createdAt,
      deletedAt: null,
    }
  }

  async updateShieldDisplaySensitivity(input: {
    workspaceId: string
    shieldDisplaySensitivity: WorkspaceRecord['shieldDisplaySensitivity']
  }): Promise<WorkspaceRecord | null> {
    const workspace = this.workspaces.get(input.workspaceId)

    if (!workspace || workspace.deletedAt) {
      return null
    }

    const updated = {
      ...workspace,
      shieldDisplaySensitivity: input.shieldDisplaySensitivity,
    }
    this.workspaces.set(input.workspaceId, updated)

    return {
      workspaceId: input.workspaceId,
      name: updated.name,
      shieldDisplaySensitivity: updated.shieldDisplaySensitivity,
      createdAt: updated.createdAt,
      deletedAt: null,
    }
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
