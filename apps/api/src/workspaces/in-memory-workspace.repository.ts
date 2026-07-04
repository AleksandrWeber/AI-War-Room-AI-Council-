import type {
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
  ])

  async findMembership(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceMembershipRecord | null> {
    return this.memberships.get(`${userId}:${workspaceId}`) ?? null
  }
}
