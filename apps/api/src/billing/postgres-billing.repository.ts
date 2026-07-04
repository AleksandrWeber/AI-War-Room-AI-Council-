import { Injectable } from '@nestjs/common'
import type {
  BillingRecord,
  BillingStatus,
  CheckoutPaidTier,
} from '@ai-war-room/schemas'
import { PAID_TIER_LIMITS } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import type { BillingRepository } from './billing.repository.js'

type BillingRecordRow = {
  billing_record_id: string
  workspace_id: string
  provider: 'stripe'
  external_customer_id: string | null
  paid_tier: BillingRecord['paidTier']
  status: BillingStatus
  created_at: Date
  updated_at: Date
}

@Injectable()
export class PostgresBillingRepository implements BillingRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async getBillingRecord(workspaceId: string): Promise<BillingRecord | null> {
    const result = await this.postgresService.query<BillingRecordRow>(
      `
        SELECT
          billing_record_id,
          workspace_id,
          provider,
          external_customer_id,
          paid_tier,
          status,
          created_at,
          updated_at
        FROM billing_records
        WHERE workspace_id = $1
        ORDER BY updated_at DESC
        LIMIT 1
      `,
      [workspaceId],
    )
    const row = result.rows[0]

    if (!row) {
      return null
    }

    return this.mapRow(row)
  }

  async activateSubscription(input: {
    workspaceId: string
    paidTier: CheckoutPaidTier
    externalCustomerId?: string
  }): Promise<BillingRecord> {
    const limits = PAID_TIER_LIMITS[input.paidTier]

    return this.postgresService.transaction(async (client) => {
      const existing = await client.query<BillingRecordRow>(
        `
          SELECT
            billing_record_id,
            workspace_id,
            provider,
            external_customer_id,
            paid_tier,
            status,
            created_at,
            updated_at
          FROM billing_records
          WHERE workspace_id = $1
          ORDER BY updated_at DESC
          LIMIT 1
        `,
        [input.workspaceId],
      )

      if (!existing.rows[0]) {
        await client.query(
          `
            INSERT INTO billing_records (
              billing_record_id,
              workspace_id,
              provider,
              external_customer_id,
              paid_tier,
              status
            )
            VALUES ($1, $2, 'stripe', $3, $4, 'active')
          `,
          [
            `billing_${input.workspaceId}`,
            input.workspaceId,
            input.externalCustomerId ?? null,
            input.paidTier,
          ],
        )
      } else {
        await client.query(
          `
            UPDATE billing_records
            SET paid_tier = $2,
                status = 'active',
                external_customer_id = COALESCE($3, external_customer_id),
                updated_at = NOW()
            WHERE billing_record_id = $1
          `,
          [
            existing.rows[0].billing_record_id,
            input.paidTier,
            input.externalCustomerId ?? null,
          ],
        )
      }

      await client.query(
        `
          INSERT INTO workspace_usage_limits (
            workspace_id,
            paid_tier,
            daily_token_limit,
            daily_cost_limit_usd
          )
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (workspace_id) DO UPDATE
          SET paid_tier = EXCLUDED.paid_tier,
              daily_token_limit = EXCLUDED.daily_token_limit,
              daily_cost_limit_usd = EXCLUDED.daily_cost_limit_usd,
              updated_at = NOW()
        `,
        [
          input.workspaceId,
          input.paidTier,
          limits.dailyTokenLimit,
          limits.dailyCostLimitUsd,
        ],
      )

      const result = await client.query<BillingRecordRow>(
        `
          SELECT
            billing_record_id,
            workspace_id,
            provider,
            external_customer_id,
            paid_tier,
            status,
            created_at,
            updated_at
          FROM billing_records
          WHERE workspace_id = $1
          ORDER BY updated_at DESC
          LIMIT 1
        `,
        [input.workspaceId],
      )
      const row = result.rows[0]

      if (!row) {
        throw new Error(`Billing record missing after activation for ${input.workspaceId}.`)
      }

      return this.mapRow(row)
    })
  }

  async updateBillingStatus(input: {
    workspaceId: string
    status: BillingStatus
    paidTier?: CheckoutPaidTier | 'free'
  }): Promise<BillingRecord | null> {
    const paidTier = input.paidTier
    const limits = paidTier ? PAID_TIER_LIMITS[paidTier] : null

    return this.postgresService.transaction(async (client) => {
      const existing = await client.query<BillingRecordRow>(
        `
          SELECT
            billing_record_id,
            workspace_id,
            provider,
            external_customer_id,
            paid_tier,
            status,
            created_at,
            updated_at
          FROM billing_records
          WHERE workspace_id = $1
          ORDER BY updated_at DESC
          LIMIT 1
        `,
        [input.workspaceId],
      )
      const row = existing.rows[0]

      if (!row) {
        return null
      }

      await client.query(
        `
          UPDATE billing_records
          SET status = $2,
              paid_tier = COALESCE($3, paid_tier),
              updated_at = NOW()
          WHERE billing_record_id = $1
        `,
        [row.billing_record_id, input.status, paidTier ?? null],
      )

      if (limits) {
        await client.query(
          `
            UPDATE workspace_usage_limits
            SET paid_tier = $2,
                daily_token_limit = $3,
                daily_cost_limit_usd = $4,
                updated_at = NOW()
            WHERE workspace_id = $1
          `,
          [
            input.workspaceId,
            paidTier,
            limits.dailyTokenLimit,
            limits.dailyCostLimitUsd,
          ],
        )
      }

      const result = await client.query<BillingRecordRow>(
        `
          SELECT
            billing_record_id,
            workspace_id,
            provider,
            external_customer_id,
            paid_tier,
            status,
            created_at,
            updated_at
          FROM billing_records
          WHERE billing_record_id = $1
          LIMIT 1
        `,
        [row.billing_record_id],
      )
      const updated = result.rows[0]

      return updated ? this.mapRow(updated) : null
    })
  }

  private mapRow(row: BillingRecordRow): BillingRecord {
    return {
      billingRecordId: row.billing_record_id,
      workspaceId: row.workspace_id,
      provider: row.provider,
      externalCustomerId: row.external_customer_id,
      paidTier: row.paid_tier,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }
  }
}
