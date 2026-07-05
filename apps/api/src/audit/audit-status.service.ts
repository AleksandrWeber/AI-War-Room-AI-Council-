import { Injectable } from '@nestjs/common'
import type { AuditTrailAdminDomain } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { CRITICAL_AUDIT_TABLES } from './audit-trail-rollout.helpers.js'

const WORKSPACE_AUDIT_DOMAINS: Array<{
  domain: AuditTrailAdminDomain
  tableName: string
  workspaceColumn: string
}> = [
  {
    domain: 'usage_events',
    tableName: 'usage_events',
    workspaceColumn: 'workspace_id',
  },
  {
    domain: 'billing_webhook_events',
    tableName: 'billing_webhook_events',
    workspaceColumn: 'workspace_id',
  },
  {
    domain: 'billing_notifications',
    tableName: 'billing_notifications',
    workspaceColumn: 'workspace_id',
  },
  {
    domain: 'meter_usage_reports',
    tableName: 'billing_meter_usage_reports',
    workspaceColumn: 'workspace_id',
  },
]

@Injectable()
export class AuditStatusService {
  constructor(private readonly postgresService: PostgresService) {}

  async pingPostgres() {
    try {
      await this.postgresService.ping()
      return true
    } catch {
      return false
    }
  }

  async getAuditTableCoverage() {
    const existingTables = await this.listExistingTables(CRITICAL_AUDIT_TABLES)

    return {
      existingAuditTableCount: existingTables.size,
      existingTables,
    }
  }

  async getWorkspaceAuditInventory(workspaceId: string) {
    const tableNames = WORKSPACE_AUDIT_DOMAINS.map((entry) => entry.tableName)
    const existingTables = await this.listExistingTables(tableNames)

    return Promise.all(
      WORKSPACE_AUDIT_DOMAINS.map(async (entry) => {
        const tableExists = existingTables.has(entry.tableName)

        if (!tableExists) {
          return {
            domain: entry.domain,
            tableName: entry.tableName,
            recordCount: 0,
            tableExists: false,
          }
        }

        const recordCount = await this.countWorkspaceRecords(
          entry.tableName,
          entry.workspaceColumn,
          workspaceId,
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

  private async countWorkspaceRecords(
    tableName: string,
    workspaceColumn: string,
    workspaceId: string,
  ) {
    try {
      const result = await this.postgresService.query<{ count: string }>(
        `
          SELECT COUNT(*)::text AS count
          FROM ${tableName}
          WHERE ${workspaceColumn} = $1
        `,
        [workspaceId],
      )

      return Number.parseInt(result.rows[0]?.count ?? '0', 10)
    } catch {
      return 0
    }
  }
}
