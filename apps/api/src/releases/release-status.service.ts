import { Injectable } from '@nestjs/common'
import type { ReleaseAdminDomain } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { CRITICAL_RELEASE_TABLES } from './release-rollout.helpers.js'

const WORKSPACE_RELEASE_DOMAINS: Array<{
  domain: ReleaseAdminDomain
  tableName: string
  requiredTables: string[]
  countQuery: (workspaceId: string) => { sql: string; params: string[] }
}> = [
  {
    domain: 'completed_runs',
    tableName: 'runs',
    requiredTables: ['runs'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count
        FROM runs
        WHERE workspace_id = $1
          AND status = 'completed'
      `,
      params: [workspaceId],
    }),
  },
  {
    domain: 'artifacts',
    tableName: 'artifacts',
    requiredTables: ['artifacts'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count
        FROM artifacts
        WHERE workspace_id = $1
      `,
      params: [workspaceId],
    }),
  },
  {
    domain: 'run_workflows',
    tableName: 'run_workflows',
    requiredTables: ['run_workflows'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count
        FROM run_workflows
        WHERE workspace_id = $1
      `,
      params: [workspaceId],
    }),
  },
  {
    domain: 'agent_outputs',
    tableName: 'agent_outputs',
    requiredTables: ['agent_outputs', 'runs'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count
        FROM agent_outputs ao
        INNER JOIN runs r ON r.run_id = ao.run_id
        WHERE r.workspace_id = $1
      `,
      params: [workspaceId],
    }),
  },
]

@Injectable()
export class ReleaseStatusService {
  constructor(private readonly postgresService: PostgresService) {}

  async pingPostgres() {
    try {
      await this.postgresService.ping()
      return true
    } catch {
      return false
    }
  }

  async getReleaseTableCoverage() {
    const existingTables = await this.listExistingTables(CRITICAL_RELEASE_TABLES)

    return {
      existingReleaseTableCount: existingTables.size,
      existingTables,
    }
  }

  async getWorkspaceReleaseInventory(workspaceId: string) {
    const allTableNames = [
      ...new Set(
        WORKSPACE_RELEASE_DOMAINS.flatMap((entry) => entry.requiredTables),
      ),
    ]
    const existingTables = await this.listExistingTables(allTableNames)

    return Promise.all(
      WORKSPACE_RELEASE_DOMAINS.map(async (entry) => {
        const tableExists = entry.requiredTables.every((tableName) =>
          existingTables.has(tableName),
        )

        if (!tableExists) {
          return {
            domain: entry.domain,
            tableName: entry.tableName,
            recordCount: 0,
            tableExists: false,
          }
        }

        const recordCount = await this.countWithQuery(
          entry.countQuery(workspaceId),
        )

        return {
          domain: entry.domain,
          tableName: entry.tableName,
          recordCount,
          tableExists: true,
        }
      }),
    )
  }

  private async listExistingTables(tableNames: readonly string[]) {
    try {
      const result = await this.postgresService.query<{ table_name: string }>(
        `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = ANY($1::text[])
        `,
        [tableNames],
      )

      return new Set(result.rows.map((row) => row.table_name))
    } catch {
      return new Set<string>()
    }
  }

  private async countWithQuery(input: { sql: string; params: string[] }) {
    try {
      const result = await this.postgresService.query<{ count: string }>(
        input.sql,
        input.params,
      )

      return Number.parseInt(result.rows[0]?.count ?? '0', 10)
    } catch {
      return 0
    }
  }
}
