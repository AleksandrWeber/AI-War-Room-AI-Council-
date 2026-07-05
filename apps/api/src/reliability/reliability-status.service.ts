import { Injectable } from '@nestjs/common'
import type { ReliabilityAdminDomain } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { CRITICAL_RELIABILITY_TABLES } from './reliability-rollout.helpers.js'

const WORKSPACE_RELIABILITY_DOMAINS: Array<{
  domain: ReliabilityAdminDomain
  tableName: string
  requiredTables: string[]
  countQuery?: (workspaceId: string) => { sql: string; params: string[] }
  globalCountQuery?: { sql: string; params: string[] }
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
    domain: 'idempotency_keys',
    tableName: 'idempotency_keys',
    requiredTables: ['idempotency_keys'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count
        FROM idempotency_keys
        WHERE workspace_id = $1
      `,
      params: [workspaceId],
    }),
  },
  {
    domain: 'model_health_events',
    tableName: 'model_health_events',
    requiredTables: ['model_health_events'],
    globalCountQuery: {
      sql: `
        SELECT COUNT(*)::text AS count
        FROM model_health_events
      `,
      params: [],
    },
  },
]

@Injectable()
export class ReliabilityStatusService {
  constructor(private readonly postgresService: PostgresService) {}

  async pingPostgres() {
    try {
      await this.postgresService.ping()
      return true
    } catch {
      return false
    }
  }

  async getReliabilityTableCoverage() {
    const existingTables = await this.listExistingTables(
      CRITICAL_RELIABILITY_TABLES,
    )

    return {
      existingReliabilityTableCount: existingTables.size,
      existingTables,
      modelHealthEventTableExists: existingTables.has('model_health_events'),
    }
  }

  async getWorkspaceReliabilityInventory(workspaceId: string) {
    const postgresTableNames = [
      ...new Set(
        WORKSPACE_RELIABILITY_DOMAINS.flatMap((entry) => entry.requiredTables),
      ),
    ]
    const existingTables = await this.listExistingTables(postgresTableNames)

    return Promise.all(
      WORKSPACE_RELIABILITY_DOMAINS.map(async (entry) => {
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

        if (entry.globalCountQuery) {
          const recordCount = await this.countWithQuery(entry.globalCountQuery)

          return {
            domain: entry.domain,
            tableName: entry.tableName,
            recordCount,
            tableExists: true,
          }
        }

        if (!entry.countQuery) {
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
