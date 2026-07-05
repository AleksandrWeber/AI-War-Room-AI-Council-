import { Injectable } from '@nestjs/common'
import type { ComplianceAdminDomain } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { CRITICAL_COMPLIANCE_TABLES } from './compliance-rollout.helpers.js'

const WORKSPACE_COMPLIANCE_DOMAINS: Array<{
  domain: ComplianceAdminDomain
  tableName: string
  workspaceColumn?: string
  joinQuery?: string
}> = [
  {
    domain: 'shield_reviews',
    tableName: 'shield_scans',
    joinQuery: `
      SELECT COUNT(*)::text AS count
      FROM shield_scans ss
      INNER JOIN runs r ON r.run_id = ss.run_id
      WHERE r.workspace_id = $1
    `,
  },
  {
    domain: 'provider_credentials',
    tableName: 'workspace_provider_credentials',
    workspaceColumn: 'workspace_id',
  },
  {
    domain: 'billing_records',
    tableName: 'billing_records',
    workspaceColumn: 'workspace_id',
  },
  {
    domain: 'usage_attestation',
    tableName: 'usage_events',
    workspaceColumn: 'workspace_id',
  },
]

@Injectable()
export class ComplianceStatusService {
  constructor(private readonly postgresService: PostgresService) {}

  async pingPostgres() {
    try {
      await this.postgresService.ping()
      return true
    } catch {
      return false
    }
  }

  async getPolicyTableCoverage() {
    const existingTables = await this.listExistingTables(CRITICAL_COMPLIANCE_TABLES)

    return {
      existingPolicyTableCount: existingTables.size,
      existingTables,
    }
  }

  async getWorkspaceComplianceInventory(workspaceId: string) {
    const tableNames = WORKSPACE_COMPLIANCE_DOMAINS.map((entry) => entry.tableName)
    const existingTables = await this.listExistingTables(tableNames)

    return Promise.all(
      WORKSPACE_COMPLIANCE_DOMAINS.map(async (entry) => {
        const tableExists = existingTables.has(entry.tableName)

        if (!tableExists) {
          return {
            domain: entry.domain,
            tableName: entry.tableName,
            recordCount: 0,
            tableExists: false,
          }
        }

        const recordCount = entry.joinQuery
          ? await this.countWithJoinQuery(entry.joinQuery, workspaceId)
          : await this.countWorkspaceRecords(
              entry.tableName,
              entry.workspaceColumn!,
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

  private async countWithJoinQuery(query: string, workspaceId: string) {
    try {
      const result = await this.postgresService.query<{ count: string }>(
        query,
        [workspaceId],
      )

      return Number.parseInt(result.rows[0]?.count ?? '0', 10)
    } catch {
      return 0
    }
  }
}
