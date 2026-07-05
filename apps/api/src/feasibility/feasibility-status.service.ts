import { Injectable } from '@nestjs/common'
import type { FeasibilityAdminDomain } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { CRITICAL_FEASIBILITY_TABLES } from './feasibility-rollout.helpers.js'

const WORKSPACE_FEASIBILITY_DOMAINS: Array<{
  domain: FeasibilityAdminDomain
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
        SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'completed'
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
        SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'failed'
      `,
      params: [workspaceId],
    }),
  },
  {
    domain: 'workspace_provider_credentials',
    tableName: 'workspace_provider_credentials',
    requiredTables: ['workspace_provider_credentials'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count FROM workspace_provider_credentials WHERE workspace_id = $1
      `,
      params: [workspaceId],
    }),
  },
  {
    domain: 'usage_events',
    tableName: 'usage_events',
    requiredTables: ['usage_events'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count FROM usage_events WHERE workspace_id = $1
      `,
      params: [workspaceId],
    }),
  },
]

@Injectable()
export class FeasibilityStatusService {
  constructor(private readonly postgresService: PostgresService) {}

  async pingPostgres() {
    try {
      await this.postgresService.ping()
      return true
    } catch {
      return false
    }
  }

  async getFeasibilityTableCoverage() {
    const existingTables = await this.listExistingTables(
      CRITICAL_FEASIBILITY_TABLES,
    )

    return {
      existingFeasibilityTableCount: existingTables.size,
      existingTables,
      workspaceProviderCredentialsTableExists: existingTables.has('workspace_provider_credentials'),
      usageEventsTableExists: existingTables.has('usage_events'),
      billingMeterUsageReportsTableExists: existingTables.has('billing_meter_usage_reports'),
    }
  }

  async getWorkspaceFeasibilityInventory(workspaceId: string) {
    const postgresTableNames = [
      ...new Set(
        WORKSPACE_FEASIBILITY_DOMAINS.flatMap((entry) => entry.requiredTables),
      ),
    ]
    const existingTables = await this.listExistingTables(postgresTableNames)

    return Promise.all(
      WORKSPACE_FEASIBILITY_DOMAINS.map(async (entry) => {
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
