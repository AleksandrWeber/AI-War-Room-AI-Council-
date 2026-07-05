import { Injectable } from '@nestjs/common'
import type { IntegrityAdminDomain } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { CRITICAL_INTEGRITY_TABLES } from './integrity-rollout.helpers.js'

const WORKSPACE_INTEGRITY_DOMAINS: Array<{
  domain: IntegrityAdminDomain
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
    domain: 'failed_runs',
    tableName: 'runs',
    requiredTables: ['runs'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count
        FROM runs
        WHERE workspace_id = $1
          AND status = 'failed'
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
    domain: 'shield_scans',
    tableName: 'shield_scans',
    requiredTables: ['shield_scans', 'runs'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count
        FROM shield_scans ss
        JOIN runs r ON r.run_id = ss.run_id
        WHERE r.workspace_id = $1
      `,
      params: [workspaceId],
    }),
  },
]

@Injectable()
export class IntegrityStatusService {
  constructor(private readonly postgresService: PostgresService) {}

  async pingPostgres() {
    try {
      await this.postgresService.ping()
      return true
    } catch {
      return false
    }
  }

  async getIntegrityTableCoverage() {
    const existingTables = await this.listExistingTables(
      CRITICAL_INTEGRITY_TABLES,
    )

    return {
      existingIntegrityTableCount: existingTables.size,
      existingTables,
      artifactsTableExists: existingTables.has('artifacts'),
      shieldScansTableExists: existingTables.has('shield_scans'),
    }
  }

  async getWorkspaceIntegrityInventory(workspaceId: string) {
    const postgresTableNames = [
      ...new Set(
        WORKSPACE_INTEGRITY_DOMAINS.flatMap((entry) => entry.requiredTables),
      ),
    ]
    const existingTables = await this.listExistingTables(postgresTableNames)

    return Promise.all(
      WORKSPACE_INTEGRITY_DOMAINS.map(async (entry) => {
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
    if (tableNames.length === 0) {
      return new Set<string>()
    }

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
