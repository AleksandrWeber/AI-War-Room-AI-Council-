import { Injectable } from '@nestjs/common'
import { PostgresService } from '../persistence/postgres.service.js'
import type {
  WorkspaceMembershipRecord,
  WorkspaceRepository,
} from './workspace.repository.js'

type WorkspaceMembershipRow = {
  workspace_id: string
  user_id: string
  role: WorkspaceMembershipRecord['role']
}

@Injectable()
export class PostgresWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async findMembership(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceMembershipRecord | null> {
    const result = await this.postgresService.query<WorkspaceMembershipRow>(
      `
        SELECT workspace_id, user_id, role
        FROM workspace_memberships
        WHERE user_id = $1
          AND workspace_id = $2
        LIMIT 1
      `,
      [userId, workspaceId],
    )
    const row = result.rows[0]

    if (!row) {
      return null
    }

    return {
      workspaceId: row.workspace_id,
      userId: row.user_id,
      role: row.role,
    }
  }
}
