import { describe, expect, it } from 'vitest'
import {
  canOpenCustomerPortal,
  describeBillingCapabilities,
  formatBillingAdminAction,
  formatBillingRolloutCheckStatus,
  formatBillingRolloutStatus,
  formatBillingStatus,
  formatInvoiceStatus,
  formatPaidTier,
  formatTierLimits,
  formatUsagePercent,
} from './billing.js'

describe('billing shared block', () => {
  it('formats tiers and statuses', () => {
    expect(formatPaidTier('pro')).toBe('Pro')
    expect(formatBillingStatus('past_due')).toBe('Past due')
    expect(formatInvoiceStatus('uncollectible')).toBe('Uncollectible')
  })

  it('formats usage percent with upper bound and invalid limit guard', () => {
    expect(formatUsagePercent(50, 100)).toBe(50)
    expect(formatUsagePercent(120, 100)).toBe(100)
    expect(formatUsagePercent(10, 0)).toBe(0)
  })

  it('exposes readable tier limits', () => {
    expect(formatTierLimits('free')).toContain('tokens')
    expect(formatTierLimits('business')).toContain('daily')
  })

  it('handles capabilities helpers', () => {
    expect(describeBillingCapabilities(null)).toContain('offline')
    expect(
      canOpenCustomerPortal(
        { supportsCustomerPortal: true } as { supportsCustomerPortal: true },
        'cus_123',
      ),
    ).toBe(true)
    expect(
      canOpenCustomerPortal(
        { supportsCustomerPortal: false } as { supportsCustomerPortal: false },
        'cus_123',
      ),
    ).toBe(false)
  })

  it('formats rollout and admin labels', () => {
    expect(formatBillingRolloutStatus('ready')).toBe('Ready')
    expect(formatBillingRolloutCheckStatus('skip')).toBe('Skip')
    expect(formatBillingAdminAction('sync_notifications')).toBe(
      'Sync notifications',
    )
  })
})
