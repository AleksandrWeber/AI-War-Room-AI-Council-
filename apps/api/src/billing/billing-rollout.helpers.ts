import type { ApiEnv } from '../config/env.js'

export type BillingRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type BillingRolloutEvaluation = {
  status: 'ready' | 'not_ready' | 'disabled'
  adapter?: ApiEnv['STRIPE_BILLING_ADAPTER']
  checks: BillingRolloutCheck[]
  guidance: string
}

export type BillingRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  stripeEnabled: boolean
  stripeBillingAdapter: ApiEnv['STRIPE_BILLING_ADAPTER']
  stripeSecretKey?: string
  stripeWebhookSecret?: string
  stripePriceIdPro?: string
  stripePriceIdBusiness?: string
  stripeSuccessUrl: string
  stripeCancelUrl: string
  stripePortalReturnUrl: string
  stripeMeteredUsageEnabled: boolean
  stripeMeterEventName?: string
  billingNotificationAdapter: ApiEnv['BILLING_NOTIFICATION_ADAPTER']
  billingNotificationRecipient?: string
}

function isProductionUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && !parsed.hostname.includes('127.0.0.1')
  } catch {
    return false
  }
}

export function evaluateBillingRollout(
  input: BillingRolloutInput,
): BillingRolloutEvaluation {
  if (!input.stripeEnabled) {
    return {
      status: 'disabled',
      checks: [
        {
          name: 'billing_enabled',
          label: 'Billing enabled',
          status: 'skip',
          detail: 'Billing is disabled. Set STRIPE_ENABLED=true to activate production billing.',
        },
      ],
      guidance:
        'Billing rollout is disabled. Enable billing before deploying paid workspace checkout.',
    }
  }

  const adapter = input.stripeBillingAdapter
  const isProduction = input.nodeEnv === 'production'
  const checks: BillingRolloutCheck[] = [
    {
      name: 'billing_enabled',
      label: 'Billing enabled',
      status: 'pass',
      detail: 'Billing checkout flows are enabled.',
    },
    {
      name: 'production_adapter',
      label: 'Production billing adapter',
      status:
        isProduction && adapter === 'mock'
          ? 'fail'
          : adapter === 'stripe' || !isProduction
            ? 'pass'
            : 'pass',
      detail:
        isProduction && adapter === 'mock'
          ? 'Mock billing adapter cannot be used in production. Set STRIPE_BILLING_ADAPTER=stripe.'
          : `Billing adapter is ${adapter}.`,
    },
  ]

  if (adapter === 'stripe') {
    checks.push(
      {
        name: 'stripe_secret_key',
        label: 'Stripe secret key',
        status: input.stripeSecretKey ? 'pass' : 'fail',
        detail: input.stripeSecretKey
          ? 'Stripe secret key is configured.'
          : 'STRIPE_SECRET_KEY is required for Stripe billing rollout.',
      },
      {
        name: 'stripe_webhook_secret',
        label: 'Stripe webhook secret',
        status: input.stripeWebhookSecret ? 'pass' : 'fail',
        detail: input.stripeWebhookSecret
          ? 'Stripe webhook secret is configured.'
          : 'STRIPE_WEBHOOK_SECRET is required for idempotent billing webhooks.',
      },
      {
        name: 'stripe_price_ids',
        label: 'Stripe price ids',
        status:
          input.stripePriceIdPro && input.stripePriceIdBusiness
            ? 'pass'
            : 'fail',
        detail:
          input.stripePriceIdPro && input.stripePriceIdBusiness
            ? 'Pro and Business Stripe price ids are configured.'
            : 'STRIPE_PRICE_ID_PRO and STRIPE_PRICE_ID_BUSINESS are required.',
      },
      {
        name: 'checkout_success_url',
        label: 'Checkout success URL',
        status:
          !isProduction || isProductionUrl(input.stripeSuccessUrl)
            ? 'pass'
            : 'fail',
        detail:
          !isProduction || isProductionUrl(input.stripeSuccessUrl)
            ? `Checkout success URL is ${input.stripeSuccessUrl}.`
            : 'Production billing requires HTTPS checkout success URLs.',
      },
      {
        name: 'checkout_cancel_url',
        label: 'Checkout cancel URL',
        status:
          !isProduction || isProductionUrl(input.stripeCancelUrl) ? 'pass' : 'fail',
        detail:
          !isProduction || isProductionUrl(input.stripeCancelUrl)
            ? `Checkout cancel URL is ${input.stripeCancelUrl}.`
            : 'Production billing requires HTTPS checkout cancel URLs.',
      },
      {
        name: 'portal_return_url',
        label: 'Portal return URL',
        status:
          !isProduction || isProductionUrl(input.stripePortalReturnUrl)
            ? 'pass'
            : 'fail',
        detail:
          !isProduction || isProductionUrl(input.stripePortalReturnUrl)
            ? `Customer portal return URL is ${input.stripePortalReturnUrl}.`
            : 'Production billing requires HTTPS customer portal return URLs.',
      },
      {
        name: 'metered_usage_config',
        label: 'Metered usage config',
        status:
          !input.stripeMeteredUsageEnabled || input.stripeMeterEventName
            ? 'pass'
            : 'fail',
        detail:
          !input.stripeMeteredUsageEnabled
            ? 'Metered usage reporting is disabled.'
            : input.stripeMeterEventName
              ? `Stripe meter event name is ${input.stripeMeterEventName}.`
              : 'STRIPE_METER_EVENT_NAME is required when metered usage is enabled.',
      },
      {
        name: 'notification_config',
        label: 'Billing notification config',
        status:
          input.billingNotificationAdapter === 'mock' ||
          (input.billingNotificationAdapter === 'email' &&
            Boolean(input.billingNotificationRecipient))
            ? 'pass'
            : 'fail',
        detail:
          input.billingNotificationAdapter === 'mock'
            ? 'Mock billing notification delivery is configured.'
            : input.billingNotificationRecipient
              ? `Email notifications route to ${input.billingNotificationRecipient}.`
              : 'BILLING_NOTIFICATION_RECIPIENT is required for email notifications.',
      },
    )
  } else {
    checks.push({
      name: 'mock_rollout_scope',
      label: 'Mock rollout scope',
      status: isProduction ? 'fail' : 'pass',
      detail: isProduction
        ? 'Mock billing is only supported for local development and tests.'
        : 'Mock billing is active for local development.',
    })
  }

  const requiredChecks = checks.filter((check) => check.status !== 'skip')
  const status = requiredChecks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    adapter,
    checks,
    guidance:
      status === 'ready'
        ? 'Billing rollout checks passed. Stripe checkout, webhooks, and billing UI are ready for production.'
        : 'Billing rollout is not ready. Resolve failed checks before enabling paid workspace checkout in production.',
  }
}
