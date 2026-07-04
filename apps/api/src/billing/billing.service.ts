import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  billingCapabilitiesResponseSchema,
  billingExportFormatSchema,
  billingInvoicesResponseSchema,
  billingWorkspaceUsageResponseSchema,
  billingWebhookEventsResponseSchema,
  billingWebhookHandleResponseSchema,
  billingWorkspaceStatusResponseSchema,
  checkoutSessionResponseSchema,
  createCheckoutSessionRequestSchema,
  createCustomerPortalSessionRequestSchema,
  customerPortalSessionResponseSchema,
  getBillingGuidance,
  mockCustomerPortalResponseSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  BILLING_ADAPTER,
  type BillingCheckoutAdapter,
  type BillingWebhookEvent,
} from './billing.adapter.js'
import { buildPaidTierInvoiceInput } from './billing-invoice.helpers.js'
import {
  buildBillingInvoiceExportFilename,
  serializeBillingInvoicesCsv,
} from './billing-export.helpers.js'
import {
  BILLING_INVOICE_REPOSITORY,
  type BillingInvoiceRepository,
} from './billing-invoice.repository.js'
import {
  BILLING_WEBHOOK_REPOSITORY,
  type BillingWebhookRepository,
} from './billing-webhook.repository.js'
import {
  BILLING_REPOSITORY,
  type BillingRepository,
} from './billing.repository.js'
import { UsageService } from '../usage/usage.service.js'

@Injectable()
export class BillingService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    @Inject(BILLING_REPOSITORY)
    private readonly billingRepository: BillingRepository,
    @Inject(BILLING_WEBHOOK_REPOSITORY)
    private readonly billingWebhookRepository: BillingWebhookRepository,
    @Inject(BILLING_INVOICE_REPOSITORY)
    private readonly billingInvoiceRepository: BillingInvoiceRepository,
    @Inject(BILLING_ADAPTER)
    private readonly billingAdapter: BillingCheckoutAdapter,
    private readonly usageService: UsageService,
  ) {}

  getCapabilities() {
    const enabled = this.configService.get('STRIPE_ENABLED', { infer: true })
    const adapter = this.configService.get('STRIPE_BILLING_ADAPTER', {
      infer: true,
    })

    return billingCapabilitiesResponseSchema.parse({
      enabled,
      adapter,
      supportsCheckout: enabled,
      supportsCustomerPortal: enabled,
      supportsWebhookAudit: enabled,
      supportsInvoiceHistory: enabled,
      supportsUsageSummary: enabled,
      supportsBillingExport: enabled,
      checkoutTiers: ['pro', 'business'],
      guidance: getBillingGuidance({ enabled, adapter }),
    })
  }

  async getWorkspaceStatus(workspaceId: string) {
    const billingRecord =
      await this.billingRepository.getBillingRecord(workspaceId)

    return billingWorkspaceStatusResponseSchema.parse({
      workspaceId,
      billingRecord,
    })
  }

  async listWorkspaceWebhookEvents(workspaceId: string) {
    const events =
      await this.billingWebhookRepository.listWorkspaceWebhookEvents(
        workspaceId,
      )

    return billingWebhookEventsResponseSchema.parse({
      workspaceId,
      events,
    })
  }

  async listWorkspaceInvoices(workspaceId: string) {
    const invoices =
      await this.billingInvoiceRepository.listWorkspaceInvoices(workspaceId)

    return billingInvoicesResponseSchema.parse({
      workspaceId,
      invoices,
    })
  }

  async getWorkspaceUsageSummary(workspaceId: string) {
    const summary = await this.usageService.getWorkspaceUsageSummary(workspaceId)

    return billingWorkspaceUsageResponseSchema.parse(summary)
  }

  async exportWorkspaceInvoices(
    workspaceId: string,
    formatInput: string | undefined,
  ) {
    const parsedFormat = billingExportFormatSchema.safeParse(formatInput ?? 'csv')

    if (!parsedFormat.success) {
      throw new BadRequestException({
        message: 'Unsupported billing export format. Use csv or json.',
      })
    }

    const format = parsedFormat.data
    const invoices =
      await this.billingInvoiceRepository.listWorkspaceInvoices(workspaceId)
    const filename = buildBillingInvoiceExportFilename(workspaceId, format)

    if (format === 'json') {
      return {
        contentType: 'application/json; charset=utf-8',
        filename,
        body: JSON.stringify(
          billingInvoicesResponseSchema.parse({
            workspaceId,
            invoices,
          }),
          null,
          2,
        ),
      }
    }

    return {
      contentType: 'text/csv; charset=utf-8',
      filename,
      body: serializeBillingInvoicesCsv(invoices),
    }
  }

  async createCheckoutSession(input: {
    workspaceId: string
    paidTier: 'pro' | 'business'
    requestWorkspaceId: string
  }) {
    this.assertBillingEnabled()

    const payload = createCheckoutSessionRequestSchema.parse({
      workspaceId: input.workspaceId,
      paidTier: input.paidTier,
    })

    if (payload.workspaceId !== input.requestWorkspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const successUrl = this.configService.get('STRIPE_SUCCESS_URL', {
      infer: true,
    })
    const cancelUrl = this.configService.get('STRIPE_CANCEL_URL', {
      infer: true,
    })

    const session = await this.billingAdapter.createCheckoutSession({
      workspaceId: payload.workspaceId,
      paidTier: payload.paidTier,
      successUrl,
      cancelUrl,
    })

    return checkoutSessionResponseSchema.parse(session)
  }

  async createCustomerPortalSession(input: {
    workspaceId: string
    requestWorkspaceId: string
  }) {
    this.assertBillingEnabled()

    const payload = createCustomerPortalSessionRequestSchema.parse({
      workspaceId: input.workspaceId,
    })

    if (payload.workspaceId !== input.requestWorkspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const billingRecord = await this.billingRepository.getBillingRecord(
      payload.workspaceId,
    )

    if (!billingRecord?.externalCustomerId) {
      throw new BadRequestException({
        message:
          'Customer portal requires an active billing customer. Complete checkout first.',
      })
    }

    const returnUrl = this.configService.get('STRIPE_PORTAL_RETURN_URL', {
      infer: true,
    })

    const session = await this.billingAdapter.createCustomerPortalSession({
      workspaceId: payload.workspaceId,
      externalCustomerId: billingRecord.externalCustomerId,
      returnUrl,
    })

    return customerPortalSessionResponseSchema.parse(session)
  }

  async getMockCustomerPortal(workspaceId: string) {
    this.assertBillingEnabled()

    if (this.configService.get('STRIPE_BILLING_ADAPTER', { infer: true }) !== 'mock') {
      throw new NotFoundException({
        message: 'Mock customer portal is only available in mock adapter mode.',
      })
    }

    const billingRecord = await this.billingRepository.getBillingRecord(workspaceId)

    if (!billingRecord?.externalCustomerId) {
      throw new NotFoundException({
        message: 'Billing customer was not found for this workspace.',
      })
    }

    const availableActions =
      billingRecord.paidTier === 'free'
        ? (['update_payment_method'] as const)
        : (['cancel_subscription', 'update_payment_method'] as const)

    return mockCustomerPortalResponseSchema.parse({
      workspaceId,
      externalCustomerId: billingRecord.externalCustomerId,
      paidTier: billingRecord.paidTier,
      status: billingRecord.status,
      availableActions: [...availableActions],
    })
  }

  async cancelMockCustomerPortalSubscription(workspaceId: string) {
    this.assertBillingEnabled()

    if (this.configService.get('STRIPE_BILLING_ADAPTER', { infer: true }) !== 'mock') {
      throw new NotFoundException({
        message: 'Mock customer portal cancellation is only available in mock adapter mode.',
      })
    }

    const billingRecord = await this.billingRepository.updateBillingStatus({
      workspaceId,
      status: 'canceled',
      paidTier: 'free',
    })

    if (!billingRecord) {
      throw new NotFoundException({
        message: 'Billing record was not found for this workspace.',
      })
    }

    return billingWorkspaceStatusResponseSchema.parse({
      workspaceId,
      billingRecord,
    })
  }

  async completeMockCheckout(sessionId: string) {
    this.assertBillingEnabled()

    if (this.configService.get('STRIPE_BILLING_ADAPTER', { infer: true }) !== 'mock') {
      throw new NotFoundException({
        message: 'Mock billing completion is only available in mock adapter mode.',
      })
    }

    const pending = await this.billingAdapter.completeMockCheckout(sessionId)

    if (!pending) {
      throw new NotFoundException({
        message: 'Checkout session was not found or already completed.',
      })
    }

    const billingRecord = await this.billingRepository.activateSubscription({
      workspaceId: pending.workspaceId,
      paidTier: pending.paidTier,
      externalCustomerId: `mock_customer_${pending.workspaceId}`,
    })

    await this.billingInvoiceRepository.upsertInvoice(
      buildPaidTierInvoiceInput({
        workspaceId: pending.workspaceId,
        provider: 'mock',
        paidTier: pending.paidTier,
        externalInvoiceId: `mock_inv_${sessionId}`,
        externalCustomerId: billingRecord.externalCustomerId,
        status: 'paid',
      }),
    )

    return billingWorkspaceStatusResponseSchema.parse({
      workspaceId: pending.workspaceId,
      billingRecord,
    })
  }

  async handleWebhook(payload: Buffer | string, signature: string | undefined) {
    this.assertBillingEnabled()

    const adapter = this.configService.get('STRIPE_BILLING_ADAPTER', {
      infer: true,
    })
    const parsed = await this.billingAdapter.parseWebhookEvent(
      payload,
      signature,
    )

    const reservation = await this.billingWebhookRepository.reserveWebhookEvent({
      externalEventId: parsed.externalEventId,
      provider: adapter,
      eventType: parsed.eventType,
      workspaceId: this.resolveWebhookWorkspaceId(parsed.providerEvent),
    })

    if (!reservation.inserted) {
      return billingWebhookHandleResponseSchema.parse({
        received: true,
        handled: false,
        duplicate: true,
        externalEventId: parsed.externalEventId,
        eventType: parsed.eventType,
      })
    }

    if (!parsed.providerEvent) {
      await this.billingWebhookRepository.finalizeWebhookEvent({
        billingWebhookEventId: reservation.record.billingWebhookEventId,
        status: 'ignored',
      })

      return billingWebhookHandleResponseSchema.parse({
        received: true,
        handled: false,
        duplicate: false,
        externalEventId: parsed.externalEventId,
        eventType: parsed.eventType,
      })
    }

    try {
      const workspaceId = await this.applyWebhookEvent(parsed.providerEvent, {
        adapter,
        externalEventId: parsed.externalEventId,
      })

      await this.billingWebhookRepository.finalizeWebhookEvent({
        billingWebhookEventId: reservation.record.billingWebhookEventId,
        status: 'processed',
        workspaceId,
      })

      return billingWebhookHandleResponseSchema.parse({
        received: true,
        handled: true,
        duplicate: false,
        externalEventId: parsed.externalEventId,
        eventType: parsed.eventType,
      })
    } catch (error) {
      await this.billingWebhookRepository.finalizeWebhookEvent({
        billingWebhookEventId: reservation.record.billingWebhookEventId,
        status: 'failed',
        errorMessage:
          error instanceof Error ? error.message : 'Webhook processing failed.',
      })

      throw error
    }
  }

  private resolveWebhookWorkspaceId(event: BillingWebhookEvent | null) {
    if (!event) {
      return null
    }

    switch (event.type) {
      case 'checkout.completed':
      case 'subscription.updated':
      case 'subscription.canceled':
        return event.workspaceId
      case 'invoice.recorded':
        return event.workspaceId ?? null
      case 'payment.failed':
        return null
    }
  }

  private async applyWebhookEvent(
    event: BillingWebhookEvent,
    context: {
      adapter: ApiEnv['STRIPE_BILLING_ADAPTER']
      externalEventId: string
    },
  ) {
    switch (event.type) {
      case 'checkout.completed':
        await this.billingRepository.activateSubscription({
          workspaceId: event.workspaceId,
          paidTier: event.paidTier,
          externalCustomerId: event.externalCustomerId,
        })
        await this.billingInvoiceRepository.upsertInvoice(
          buildPaidTierInvoiceInput({
            workspaceId: event.workspaceId,
            provider: context.adapter,
            paidTier: event.paidTier,
            externalInvoiceId: `inv_${context.externalEventId}`,
            externalCustomerId: event.externalCustomerId ?? null,
            status: 'paid',
          }),
        )
        return event.workspaceId
      case 'subscription.updated':
        await this.billingRepository.updateBillingStatus({
          workspaceId: event.workspaceId,
          status: event.status,
          paidTier: event.paidTier,
        })
        return event.workspaceId
      case 'subscription.canceled':
        await this.billingRepository.updateBillingStatus({
          workspaceId: event.workspaceId,
          status: 'canceled',
          paidTier: 'free',
        })
        return event.workspaceId
      case 'payment.failed': {
        const billingRecord =
          await this.billingRepository.getBillingRecordByExternalCustomerId(
            event.externalCustomerId,
          )

        if (!billingRecord) {
          throw new NotFoundException({
            message: `Billing customer ${event.externalCustomerId} was not found.`,
          })
        }

        await this.billingRepository.updateBillingStatus({
          workspaceId: billingRecord.workspaceId,
          status: 'past_due',
        })

        if (event.externalInvoiceId && event.amountTotalUsd !== undefined) {
          await this.billingInvoiceRepository.upsertInvoice({
            workspaceId: billingRecord.workspaceId,
            provider: context.adapter,
            externalInvoiceId: event.externalInvoiceId,
            externalCustomerId: event.externalCustomerId,
            paidTier: event.paidTier ?? billingRecord.paidTier,
            amountTotalUsd: event.amountTotalUsd,
            currency: event.currency ?? 'usd',
            status: 'failed',
            hostedInvoiceUrl: null,
            invoicePdfUrl: null,
            periodStart: null,
            periodEnd: null,
          })
        }

        return billingRecord.workspaceId
      }
      case 'invoice.recorded': {
        const workspaceId = await this.resolveInvoiceWorkspaceId(event)

        if (!workspaceId) {
          throw new NotFoundException({
            message: `Workspace could not be resolved for invoice ${event.externalInvoiceId}.`,
          })
        }

        await this.billingInvoiceRepository.upsertInvoice({
          workspaceId,
          provider: context.adapter,
          externalInvoiceId: event.externalInvoiceId,
          externalCustomerId: event.externalCustomerId ?? null,
          paidTier: event.paidTier ?? null,
          amountTotalUsd: event.amountTotalUsd,
          currency: event.currency,
          status: event.status,
          hostedInvoiceUrl: event.hostedInvoiceUrl ?? null,
          invoicePdfUrl: event.invoicePdfUrl ?? null,
          periodStart: event.periodStart ?? null,
          periodEnd: event.periodEnd ?? null,
        })

        return workspaceId
      }
    }
  }

  private async resolveInvoiceWorkspaceId(
    event: Extract<BillingWebhookEvent, { type: 'invoice.recorded' }>,
  ) {
    if (event.workspaceId) {
      return event.workspaceId
    }

    if (!event.externalCustomerId) {
      return null
    }

    const billingRecord =
      await this.billingRepository.getBillingRecordByExternalCustomerId(
        event.externalCustomerId,
      )

    return billingRecord?.workspaceId ?? null
  }

  private assertBillingEnabled() {
    if (!this.configService.get('STRIPE_ENABLED', { infer: true })) {
      throw new ServiceUnavailableException({
        message: 'Billing is disabled. Set STRIPE_ENABLED=true to activate checkout.',
      })
    }
  }
}
