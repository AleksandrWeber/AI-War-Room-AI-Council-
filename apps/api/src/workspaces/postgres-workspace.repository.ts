import { Injectable } from '@nestjs/common'
import { PostgresService } from '../persistence/postgres.service.js'
import type {
  ProvisionExternalMemberInput,
  ProvisionExternalMemberResult,
  WorkspaceMemberRecord,
  WorkspaceMembershipRecord,
  WorkspaceRepository,
} from './workspace.repository.js'

type WorkspaceMembershipRow = {
  workspace_id: string
  user_id: string
  role: WorkspaceMembershipRecord['role']
  email: string | null
  display_name: string | null
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

  async provisionExternalMember(
    input: ProvisionExternalMemberInput,
  ): Promise<ProvisionExternalMemberResult> {
    return this.postgresService.transaction(async (client) => {
      const actions: ProvisionExternalMemberResult['actions'] = []

      const existingUser = await client.query<{ user_id: string }>(
        `SELECT user_id FROM app_users WHERE user_id = $1 LIMIT 1`,
        [input.userId],
      )

      if (existingUser.rows[0]) {
        await client.query(
          `
            UPDATE app_users
            SET email = COALESCE($2, email),
                display_name = COALESCE($3, display_name)
            WHERE user_id = $1
          `,
          [input.userId, input.email ?? null, input.displayName ?? null],
        )
        actions.push('updated_user')
      } else {
        await client.query(
          `
            INSERT INTO app_users (user_id, email, display_name)
            VALUES ($1, $2, $3)
          `,
          [
            input.userId,
            input.email ?? null,
            input.displayName ?? input.userId,
          ],
        )
        actions.push('created_user')
      }

      const existingWorkspace = await client.query<{ workspace_id: string }>(
        `SELECT workspace_id FROM workspaces WHERE workspace_id = $1 LIMIT 1`,
        [input.workspaceId],
      )

      if (!existingWorkspace.rows[0]) {
        await client.query(
          `
            INSERT INTO workspaces (workspace_id, name)
            VALUES ($1, $2)
          `,
          [input.workspaceId, `Workspace ${input.workspaceId}`],
        )
        actions.push('created_workspace')

        await client.query(
          `
            INSERT INTO workspace_usage_limits (
              workspace_id,
              paid_tier,
              daily_token_limit,
              daily_cost_limit_usd
            )
            VALUES ($1, 'free', 250000, 25.0000)
            ON CONFLICT (workspace_id) DO NOTHING
          `,
          [input.workspaceId],
        )

        await client.query(
          `
            INSERT INTO billing_records (
              billing_record_id,
              workspace_id,
              provider,
              paid_tier,
              status
            )
            VALUES ($1, $2, 'stripe', 'free', 'draft')
            ON CONFLICT (billing_record_id) DO NOTHING
          `,
          [`billing_${input.workspaceId}`, input.workspaceId],
        )
      }

      const existingMembership = await client.query<WorkspaceMembershipRow>(
        `
          SELECT workspace_id, user_id, role
          FROM workspace_memberships
          WHERE user_id = $1
            AND workspace_id = $2
          LIMIT 1
        `,
        [input.userId, input.workspaceId],
      )

      if (!existingMembership.rows[0]) {
        const role = existingWorkspace.rows[0] ? 'member' : 'owner'

        await client.query(
          `
            INSERT INTO workspace_memberships (workspace_id, user_id, role)
            VALUES ($1, $2, $3)
          `,
          [input.workspaceId, input.userId, role],
        )
        actions.push('created_membership')

        return {
          workspaceId: input.workspaceId,
          userId: input.userId,
          role,
          actions,
        }
      }

      return {
        workspaceId: existingMembership.rows[0].workspace_id,
        userId: existingMembership.rows[0].user_id,
        role: existingMembership.rows[0].role,
        actions,
      }
    })
  }

  async listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberRecord[]> {
    const result = await this.postgresService.query<WorkspaceMembershipRow>(
      `
        SELECT
          wm.workspace_id,
          wm.user_id,
          wm.role,
          au.email,
          au.display_name
        FROM workspace_memberships wm
        LEFT JOIN app_users au ON au.user_id = wm.user_id
        WHERE wm.workspace_id = $1
        ORDER BY wm.user_id ASC
      `,
      [workspaceId],
    )

    return result.rows.map((row) => ({
      workspaceId: row.workspace_id,
      userId: row.user_id,
      role: row.role,
      email: row.email,
      displayName: row.display_name,
    }))
  }

  async updateMemberRole(input: {
    workspaceId: string
    userId: string
    role: WorkspaceMembershipRecord['role']
  }): Promise<WorkspaceMemberRecord | null> {
    const result = await this.postgresService.query<WorkspaceMembershipRow>(
      `
        UPDATE workspace_memberships
        SET role = $3
        WHERE workspace_id = $1
          AND user_id = $2
        RETURNING workspace_id, user_id, role
      `,
      [input.workspaceId, input.userId, input.role],
    )
    const row = result.rows[0]

    if (!row) {
      return null
    }

    const profile = await this.postgresService.query<{
      email: string | null
      display_name: string | null
    }>(
      `SELECT email, display_name FROM app_users WHERE user_id = $1 LIMIT 1`,
      [input.userId],
    )

    return {
      workspaceId: row.workspace_id,
      userId: row.user_id,
      role: row.role,
      email: profile.rows[0]?.email ?? null,
      displayName: profile.rows[0]?.display_name ?? null,
    }
  }

  async removeMember(input: {
    workspaceId: string
    userId: string
  }): Promise<boolean> {
    const result = await this.postgresService.query(
      `
        DELETE FROM workspace_memberships
        WHERE workspace_id = $1
          AND user_id = $2
      `,
      [input.workspaceId, input.userId],
    )

    return (result.rowCount ?? 0) > 0
  }

  async addWorkspaceMember(input: {
    workspaceId: string
    userId: string
    role: WorkspaceMembershipRecord['role']
    email?: string
    displayName?: string
  }): Promise<WorkspaceMemberRecord> {
    await this.postgresService.query(
      `
        INSERT INTO app_users (user_id, email, display_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE
        SET email = COALESCE(EXCLUDED.email, app_users.email),
            display_name = COALESCE(EXCLUDED.display_name, app_users.display_name)
      `,
      [
        input.userId,
        input.email ?? null,
        input.displayName ?? input.userId,
      ],
    )

    await this.postgresService.query(
      `
        INSERT INTO workspace_memberships (workspace_id, user_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (workspace_id, user_id) DO UPDATE
        SET role = EXCLUDED.role
      `,
      [input.workspaceId, input.userId, input.role],
    )

    const members = await this.listWorkspaceMembers(input.workspaceId)
    const member = members.find((entry) => entry.userId === input.userId)

    if (!member) {
      throw new Error(`Workspace member ${input.userId} was not found after insert.`)
    }

    return member
  }
}
