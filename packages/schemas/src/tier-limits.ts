import type { PaidTier } from './usage.js'

export const PAID_TIER_LIMITS: Record<
  PaidTier,
  { dailyTokenLimit: number; dailyCostLimitUsd: number }
> = {
  free: {
    dailyTokenLimit: 250_000,
    dailyCostLimitUsd: 25,
  },
  pro: {
    dailyTokenLimit: 1_000_000,
    dailyCostLimitUsd: 100,
  },
  business: {
    dailyTokenLimit: 5_000_000,
    dailyCostLimitUsd: 500,
  },
}

export const PAID_TIER_INVOICE_AMOUNTS_USD = {
  pro: 29,
  business: 99,
} as const
