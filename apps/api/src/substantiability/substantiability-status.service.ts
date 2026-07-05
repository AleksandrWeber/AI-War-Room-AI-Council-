import { Injectable } from '@nestjs/common'
import type { SubstantiabilityAdminDomain } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { CRITICAL_SUBSTANTIABILITY_TABLES } from './substantiability-rollout.helpers.js'

const WORKSPACE_SUBSTANTIABILITY_DOMAINS: Array<{
  domain: SubstantiabilityAdminDomain
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
    domain: 'billing_records',
    tableName: 'billing_records',
    requiredTables: ['billing_records'],
    countQuery: (workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count FROM billing_records WHERE workspace_id = $1
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
        SELECT COUNT(*)::text AS count FROM idempotency_keys WHERE workspace_id = $1
      `,
      params: [workspaceId],
    }),
  },
]

@Injectable()
export class SubstantiabilityStatusService {
  constructor(private readonly postgresService: PostgresService) {}

  async pingPostgres() {
    try {
      await this.postgresService.ping()
      return true
    } catch {
      return false
    }
  }

  async getSubstantiabilityTableCoverage() {
    const existingTables = await this.listExistingTables(
      CRITICAL_SUBSTANTIABILITY_TABLES,
    )

    return {
      existingSubstantiabilityTableCount: existingTables.size,
      existingTables,
      billingRecordsTableExists: existingTables.has('billing_records'),
      billingWebhookEventsTableExists: existingTables.has('billing_webhook_events'),
      idempotencyKeysTableExists: existingTables.has('idempotency_keys'),
    }
  }

  async getWorkspaceSubstantiabilityInventory(workspaceId: string) {
    const postgresTableNames = [
      ...new Set(
        WORKSPACE_SUBSTANTIABILITY_DOMAINS.flatMap((entry) => entry.requiredTables),
      ),
    ]
    const existingTables = await this.listExistingTables(postgresTableNames)

    return Promise.all(
      WORKSPACE_SUBSTANTIABILITY_DOMAINS.map(async (entry) => {
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
