import type {
  BillingCapabilitiesResponse,
  BillingStatus,
  CheckoutPaidTier,
  MockCustomerPortalResponse,
  PaidTier,
} from '@ai-war-room/schemas'
import {
  PAID_TIER_LIMITS,
  billingCapabilitiesResponseSchema,
  billingWorkspaceStatusResponseSchema,
  checkoutSessionResponseSchema,
  customerPortalSessionResponseSchema,
  mockCustomerPortalResponseSchema,
} from '@ai-war-room/schemas'

export const defaultWorkspaceId = 'local_workspace'

export type BillingReturnHint = 'success' | 'cancel' | 'portal'

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

export function readBillingReturnHint(): BillingReturnHint | null {
  const url = new URL(window.location.href)

  if (
    url.searchParams.get('billing') === 'success' ||
    url.pathname.endsWith('/billing/success')
  ) {
    return 'success'
  }

  if (
    url.searchParams.get('billing') === 'cancel' ||
    url.pathname.endsWith('/billing/cancel')
  ) {
    return 'cancel'
  }

  if (
    url.searchParams.get('billing') === 'portal' ||
    url.pathname.endsWith('/billing/portal')
  ) {
    return 'portal'
  }

  return null
}

export function clearBillingReturnHint() {
  const url = new URL(window.location.href)
  url.searchParams.delete('billing')

  if (
    url.pathname.endsWith('/billing/success') ||
    url.pathname.endsWith('/billing/cancel') ||
    url.pathname.endsWith('/billing/portal')
  ) {
    url.pathname = '/'
  }

  window.history.replaceState({}, '', url)
}

export async function fetchBillingCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/billing/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingCapabilitiesResponseSchema.parse(await response.json())
}

export async function fetchBillingWorkspaceStatus(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/billing/workspace/${encodeURIComponent(workspaceId)}`,
    {
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingWorkspaceStatusResponseSchema.parse(await response.json())
}

export async function createBillingCheckoutSession(
  apiBaseUrl: string,
  workspaceId: string,
  paidTier: CheckoutPaidTier,
  headers: Record<string, string>,
) {
  const response = await fetch(`${apiBaseUrl}/billing/checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      workspaceId,
      paidTier,
    }),
  })

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return checkoutSessionResponseSchema.parse(await response.json())
}

export async function createCustomerPortalSession(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(`${apiBaseUrl}/billing/customer-portal-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      workspaceId,
    }),
  })

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return customerPortalSessionResponseSchema.parse(await response.json())
}

export async function fetchMockCustomerPortal(portalUrl: string) {
  const response = await fetch(portalUrl)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mockCustomerPortalResponseSchema.parse(await response.json())
}

export async function cancelMockCustomerPortalSubscription(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(`${apiBaseUrl}/billing/mock/portal/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      workspaceId,
    }),
  })

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingWorkspaceStatusResponseSchema.parse(await response.json())
}

export async function completeMockBillingCheckout(checkoutUrl: string) {
  const response = await fetch(checkoutUrl)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return billingWorkspaceStatusResponseSchema.parse(await response.json())
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
  return Boolean(
    capabilities?.supportsCustomerPortal && externalCustomerId,
  )
}

export type { MockCustomerPortalResponse }
