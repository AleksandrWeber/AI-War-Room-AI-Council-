import type {
  ProvisionExternalMemberInput,
  ProvisionExternalMemberResult,
  WorkspaceMembershipRecord,
  WorkspaceRepository,
} from './workspace.repository.js'

export class InMemoryWorkspaceRepository implements WorkspaceRepository {
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
}
