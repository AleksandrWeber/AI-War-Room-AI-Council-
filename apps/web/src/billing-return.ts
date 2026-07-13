export type BillingReturnHint = 'success' | 'cancel' | 'portal'

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
