import { Injectable } from '@nestjs/common'
import type { IncidentAdminDomain } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { CRITICAL_INCIDENT_TABLES } from './incident-response-rollout.helpers.js'

const WORKSPACE_INCIDENT_DOMAINS: Array<{
  domain: IncidentAdminDomain
  tableName: string
  countQuery: (workspaceId: string) => { sql: string; params: string[] }
  requiredTables: string[]
}> = [
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
    domain: 'blocked_runs',
    tableName: 'runs',
    requiredTables: ['runs'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count
        FROM runs
        WHERE workspace_id = $1
          AND status = 'blocked'
      `,
      params: [workspaceId],
    }),
  },
  {
    domain: 'billing_alerts',
    tableName: 'billing_notifications',
    requiredTables: ['billing_notifications'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count
        FROM billing_notifications
        WHERE workspace_id = $1
      `,
      params: [workspaceId],
    }),
  },
  {
    domain: 'shield_incidents',
    tableName: 'shield_scans',
    requiredTables: ['shield_scans', 'runs'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count
        FROM shield_scans ss
        INNER JOIN runs r ON r.run_id = ss.run_id
        WHERE r.workspace_id = $1
      `,
      params: [workspaceId],
    }),
  },
]

@Injectable()
export class IncidentStatusService {
  constructor(private readonly postgresService: PostgresService) {}

  async pingPostgres() {
    try {
      await this.postgresService.ping()
      return true
    } catch {
      return false
    }
  }

  async getIncidentTableCoverage() {
    const existingTables = await this.listExistingTables(CRITICAL_INCIDENT_TABLES)

    return {
      existingIncidentTableCount: existingTables.size,
      existingTables,
    }
  }

  async getWorkspaceIncidentInventory(workspaceId: string) {
    const allTableNames = [
      ...new Set(
        WORKSPACE_INCIDENT_DOMAINS.flatMap((entry) => entry.requiredTables),
      ),
    ]
    const existingTables = await this.listExistingTables(allTableNames)

    return Promise.all(
      WORKSPACE_INCIDENT_DOMAINS.map(async (entry) => {
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
