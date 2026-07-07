import type {
  BillingCapabilitiesResponse,
  BillingInvoiceStatus,
  BillingStatus,
  PaidTier,
} from '@ai-war-room/schemas'
import { PAID_TIER_LIMITS } from '@ai-war-room/schemas'

export function formatPaidTier(tier: PaidTier) {
  switch (tier) {
    case 'free':
      return 'Free'
    case 'pro':
      return 'Pro'
    case 'business':
      return 'Business'
  }
}

export function formatBillingStatus(status: BillingStatus) {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'active':
      return 'Active'
    case 'past_due':
      return 'Past due'
    case 'canceled':
      return 'Canceled'
  }
}

export function formatTierLimits(tier: PaidTier) {
  const limits = PAID_TIER_LIMITS[tier]
  return `${limits.dailyTokenLimit.toLocaleString()} tokens / $${limits.dailyCostLimitUsd} daily`
}

export function formatUsagePercent(used: number, limit: number) {
  if (limit <= 0) {
    return 0
  }

  return Math.min(100, Math.round((used / limit) * 100))
}

export function formatUsageMeterLabel(used: number, limit: number, unit: string) {
  return `${used.toLocaleString()} / ${limit.toLocaleString()} ${unit}`
}

export function formatUsageCostLabel(usedUsd: number, limitUsd: number) {
  return `$${usedUsd.toFixed(2)} / $${limitUsd.toFixed(2)} daily`
}

export function formatInvoiceStatus(status: BillingInvoiceStatus) {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'open':
      return 'Open'
    case 'paid':
      return 'Paid'
    case 'void':
      return 'Void'
    case 'uncollectible':
      return 'Uncollectible'
    case 'failed':
      return 'Failed'
  }
}

export function formatInvoiceAmount(amountTotalUsd: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountTotalUsd)
}

export function describeBillingCapabilities(
  capabilities: BillingCapabilitiesResponse | null,
) {
  if (!capabilities) {
    return 'Billing capabilities are unavailable while the API is offline.'
  }

  return capabilities.guidance
}

export function canOpenCustomerPortal(
  capabilities: BillingCapabilitiesResponse | null,
  externalCustomerId: string | null | undefined,
) {
  return Boolean(capabilities?.supportsCustomerPortal && externalCustomerId)
}

export function formatBillingRolloutStatus(
  status: 'ready' | 'not_ready' | 'disabled',
) {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
    case 'disabled':
      return 'Disabled'
  }
}

export function formatBillingRolloutCheckStatus(
  status: 'pass' | 'fail' | 'skip',
) {
  switch (status) {
    case 'pass':
      return 'Pass'
    case 'fail':
      return 'Fail'
    case 'skip':
      return 'Skip'
  }
}

export function formatBillingAlertSeverity(
  severity: 'info' | 'warning' | 'critical',
) {
  switch (severity) {
    case 'info':
      return 'Info'
    case 'warning':
      return 'Warning'
    case 'critical':
      return 'Critical'
  }
}

export function formatBillingNotificationStatus(
  status: 'pending' | 'delivered' | 'failed',
) {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'delivered':
      return 'Delivered'
    case 'failed':
      return 'Failed'
  }
}

export function formatMeterUsageReportStatus(
  status: 'reported' | 'skipped' | 'failed',
) {
  switch (status) {
    case 'reported':
      return 'Reported'
    case 'skipped':
      return 'Skipped'
    case 'failed':
      return 'Failed'
  }
}

export function formatBillingAdminAction(
  action: 'sync_notifications' | 'reset_mock_billing',
) {
  switch (action) {
    case 'sync_notifications':
      return 'Sync notifications'
    case 'reset_mock_billing':
      return 'Reset mock billing'
  }
}
