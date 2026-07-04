import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  billingCapabilitiesResponseSchema,
  billingWorkspaceStatusResponseSchema,
  checkoutSessionResponseSchema,
  createCheckoutSessionRequestSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  BILLING_ADAPTER,
  type BillingCheckoutAdapter,
  type BillingWebhookEvent,
} from './billing.adapter.js'
import {
  BILLING_REPOSITORY,
  type BillingRepository,
} from './billing.repository.js'

@Injectable()
export class BillingService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    @Inject(BILLING_REPOSITORY)
    private readonly billingRepository: BillingRepository,
    @Inject(BILLING_ADAPTER)
    private readonly billingAdapter: BillingCheckoutAdapter,
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
      checkoutTiers: ['pro', 'business'],
      guidance: enabled
        ? adapter === 'mock'
          ? 'Mock billing is active. Checkout returns a local completion URL for development and tests.'
          : 'Stripe billing is active. Use POST /api/billing/checkout-session to start checkout and configure Stripe webhooks to POST /api/billing/webhook.'
        : 'Billing checkout is disabled. Set STRIPE_ENABLED=true to activate billing flows.',
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

    return billingWorkspaceStatusResponseSchema.parse({
      workspaceId: pending.workspaceId,
      billingRecord,
    })
  }

  async handleWebhook(payload: Buffer | string, signature: string | undefined) {
    this.assertBillingEnabled()

    const event = await this.billingAdapter.parseWebhookEvent(
      payload,
      signature,
    )

    if (!event) {
      return { received: true, handled: false }
    }

    await this.applyWebhookEvent(event)

    return { received: true, handled: true }
  }

  private async applyWebhookEvent(event: BillingWebhookEvent) {
    switch (event.type) {
      case 'checkout.completed':
        await this.billingRepository.activateSubscription({
          workspaceId: event.workspaceId,
          paidTier: event.paidTier,
          externalCustomerId: event.externalCustomerId,
        })
        return
      case 'subscription.updated':
        await this.billingRepository.updateBillingStatus({
          workspaceId: event.workspaceId,
          status: event.status,
          paidTier: event.paidTier,
        })
        return
      case 'subscription.canceled':
        await this.billingRepository.updateBillingStatus({
          workspaceId: event.workspaceId,
          status: 'canceled',
          paidTier: 'free',
        })
        return
    }
  }

  private assertBillingEnabled() {
    if (!this.configService.get('STRIPE_ENABLED', { infer: true })) {
      throw new ServiceUnavailableException({
        message: 'Billing is disabled. Set STRIPE_ENABLED=true to activate checkout.',
      })
    }
  }
}
