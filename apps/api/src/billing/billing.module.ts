import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BILLING_ADAPTER } from './billing.adapter.js'
import { BillingController } from './billing.controller.js'
import { BillingService } from './billing.service.js'
import { BILLING_REPOSITORY } from './billing.repository.js'
import { InMemoryBillingRepository } from './in-memory-billing.repository.js'
import { MockBillingAdapter } from './mock-billing.adapter.js'
import { PostgresBillingRepository } from './postgres-billing.repository.js'
import { PostgresBillingInvoiceRepository } from './postgres-billing-invoice.repository.js'
import { PostgresBillingWebhookRepository } from './postgres-billing-webhook.repository.js'
import { StripeBillingAdapter } from './stripe-billing.adapter.js'
import { BILLING_INVOICE_REPOSITORY } from './billing-invoice.repository.js'
import { BILLING_WEBHOOK_REPOSITORY } from './billing-webhook.repository.js'
import { InMemoryBillingInvoiceRepository } from './in-memory-billing-invoice.repository.js'
import { InMemoryBillingWebhookRepository } from './in-memory-billing-webhook.repository.js'

@Module({
  imports: [PersistenceModule, AuthModule, WorkspacesModule],
  controllers: [BillingController],
  providers: [
    PostgresBillingRepository,
    PostgresBillingWebhookRepository,
    PostgresBillingInvoiceRepository,
    BillingService,
    {
      provide: BILLING_REPOSITORY,
      inject: [ConfigService, PostgresBillingRepository],
      useFactory: (
        configService: ConfigService<ApiEnv, true>,
        postgresBillingRepository: PostgresBillingRepository,
      ) => {
        return configService.get('NODE_ENV', { infer: true }) === 'test'
          ? new InMemoryBillingRepository()
          : postgresBillingRepository
      },
    },
    {
      provide: BILLING_INVOICE_REPOSITORY,
      inject: [ConfigService, PostgresBillingInvoiceRepository],
      useFactory: (
        configService: ConfigService<ApiEnv, true>,
        postgresBillingInvoiceRepository: PostgresBillingInvoiceRepository,
      ) => {
        return configService.get('NODE_ENV', { infer: true }) === 'test'
          ? new InMemoryBillingInvoiceRepository()
          : postgresBillingInvoiceRepository
      },
    },
    {
      provide: BILLING_WEBHOOK_REPOSITORY,
      inject: [ConfigService, PostgresBillingWebhookRepository],
      useFactory: (
        configService: ConfigService<ApiEnv, true>,
        postgresBillingWebhookRepository: PostgresBillingWebhookRepository,
      ) => {
        return configService.get('NODE_ENV', { infer: true }) === 'test'
          ? new InMemoryBillingWebhookRepository()
          : postgresBillingWebhookRepository
      },
    },
    {
      provide: BILLING_ADAPTER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ApiEnv, true>) => {
        const adapter = configService.get('STRIPE_BILLING_ADAPTER', {
          infer: true,
        })
        const apiPort = configService.get('API_PORT', { infer: true })

        if (adapter === 'stripe') {
          return new StripeBillingAdapter(
            configService.get('STRIPE_SECRET_KEY', { infer: true })!,
            configService.get('STRIPE_WEBHOOK_SECRET', { infer: true })!,
            {
              pro: configService.get('STRIPE_PRICE_ID_PRO', { infer: true })!,
              business: configService.get('STRIPE_PRICE_ID_BUSINESS', {
                infer: true,
              })!,
            },
          )
        }

        return new MockBillingAdapter(`http://127.0.0.1:${apiPort}`)
      },
    },
  ],
  exports: [BillingService],
})
export class BillingModule {}
