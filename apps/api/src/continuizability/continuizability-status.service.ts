import { Injectable } from '@nestjs/common'
import type { ContinuizabilityAdminDomain } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { CRITICAL_CONTINUIZABILITY_TABLES } from './continuizability-rollout.helpers.js'

const WORKSPACE_CONTINUIZABILITY_DOMAINS: Array<{
  domain: ContinuizabilityAdminDomain
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
    domain: 'model_registry_entries',
    tableName: 'model_registry_entries',
    requiredTables: ['model_registry_entries'],
    countQuery: (_workspaceId) => ({
      sql: `
        SELECT COUNT(*)::text AS count FROM model_registry_entries
      `,
      params: [],
    }),
  },
]

@Injectable()
export class ContinuizabilityStatusService {
  constructor(private readonly postgresService: PostgresService) {}

  async pingPostgres() {
    try {
      await this.postgresService.ping()
      return true
    } catch {
      return false
    }
  }

  async getContinuizabilityTableCoverage() {
    const existingTables = await this.listExistingTables(
      CRITICAL_CONTINUIZABILITY_TABLES,
    )

    return {
      existingContinuizabilityTableCount: existingTables.size,
      existingTables,
      workspaceProviderCredentialsTableExists: existingTables.has('workspace_provider_credentials'),
      modelRegistryEntriesTableExists: existingTables.has('model_registry_entries'),
      billingWebhookEventsTableExists: existingTables.has('billing_webhook_events'),
    }
  }

  async getWorkspaceContinuizabilityInventory(workspaceId: string) {
    const postgresTableNames = [
      ...new Set(
        WORKSPACE_CONTINUIZABILITY_DOMAINS.flatMap((entry) => entry.requiredTables),
      ),
    ]
    const existingTables = await this.listExistingTables(postgresTableNames)

    return Promise.all(
      WORKSPACE_CONTINUIZABILITY_DOMAINS.map(async (entry) => {
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
