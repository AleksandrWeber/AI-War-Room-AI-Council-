import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { billingMeterUsageReportsResponseSchema } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { BILLING_ADAPTER, type BillingCheckoutAdapter } from './billing.adapter.js'
import {
  BILLING_METER_USAGE_REPOSITORY,
  type BillingMeterUsageRepository,
} from './billing-meter-usage.repository.js'
import { BILLING_REPOSITORY, type BillingRepository } from './billing.repository.js'

@Injectable()
export class BillingMeterUsageService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    @Inject(BILLING_REPOSITORY)
    private readonly billingRepository: BillingRepository,
    @Inject(BILLING_METER_USAGE_REPOSITORY)
    private readonly billingMeterUsageRepository: BillingMeterUsageRepository,
    @Inject(BILLING_ADAPTER)
    private readonly billingAdapter: BillingCheckoutAdapter,
  ) {}

  supportsMeteredUsage() {
    if (!this.configService.get('STRIPE_ENABLED', { infer: true })) {
      return false
    }

    const adapter = this.configService.get('STRIPE_BILLING_ADAPTER', {
      infer: true,
    })

    if (adapter === 'mock') {
      return true
    }

    return this.configService.get('STRIPE_METERED_USAGE_ENABLED', {
      infer: true,
    })
  }

  async listWorkspaceMeterUsageReports(workspaceId: string) {
    const reports =
      await this.billingMeterUsageRepository.listWorkspaceReports(workspaceId)

    return billingMeterUsageReportsResponseSchema.parse({
      workspaceId,
      reports,
    })
  }

  async reportRunTokenUsage(input: {
    workspaceId: string
    runId: string
    totalTokens: number
  }) {
    if (!this.supportsMeteredUsage() || input.totalTokens <= 0) {
      return null
    }

    const adapter = this.configService.get('STRIPE_BILLING_ADAPTER', {
      infer: true,
    })
    const billingRecord =
      await this.billingRepository.getBillingRecord(input.workspaceId)

    if (
      !billingRecord ||
      billingRecord.status !== 'active' ||
      billingRecord.paidTier === 'free'
    ) {
      return this.billingMeterUsageRepository.createReport({
        workspaceId: input.workspaceId,
        provider: adapter,
        metric: 'tokens',
        quantity: input.totalTokens,
        status: 'skipped',
        errorMessage: 'Metered usage reporting requires an active paid subscription.',
        runId: input.runId,
      })
    }

    if (!billingRecord.externalSubscriptionItemId) {
      return this.billingMeterUsageRepository.createReport({
        workspaceId: input.workspaceId,
        provider: adapter,
        metric: 'tokens',
        quantity: input.totalTokens,
        status: 'skipped',
        errorMessage: 'Billing subscription item id is missing for metered usage reporting.',
        runId: input.runId,
      })
    }

    try {
      const result = await this.billingAdapter.reportMeteredUsage({
        externalSubscriptionItemId: billingRecord.externalSubscriptionItemId,
        externalCustomerId: billingRecord.externalCustomerId ?? undefined,
        quantity: input.totalTokens,
      })

      return this.billingMeterUsageRepository.createReport({
        workspaceId: input.workspaceId,
        provider: adapter,
        externalSubscriptionItemId: billingRecord.externalSubscriptionItemId,
        externalUsageRecordId: result.externalUsageRecordId,
        metric: 'tokens',
        quantity: input.totalTokens,
        status: 'reported',
        runId: input.runId,
      })
    } catch (error) {
      return this.billingMeterUsageRepository.createReport({
        workspaceId: input.workspaceId,
        provider: adapter,
        externalSubscriptionItemId: billingRecord.externalSubscriptionItemId,
        metric: 'tokens',
        quantity: input.totalTokens,
        status: 'failed',
        errorMessage:
          error instanceof Error
            ? error.message
            : 'Metered usage reporting failed.',
        runId: input.runId,
      })
    }
  }
}
