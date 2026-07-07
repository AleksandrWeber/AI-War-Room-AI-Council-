import { Suspense, lazy } from 'react'
import type { OperationsAdminBulkProps } from './operations-admin/OperationsAdminBulk'
import type { DomainAdminBulkProps } from './domain-admin/DomainAdminBulk'

const LazyOperationsAdminBulk = lazy(async () => {
  const module = await import('./operations-admin/OperationsAdminBulk')
  return { default: module.default }
})

const LazyDomainAdminBulk = lazy(async () => {
  const module = await import('./domain-admin/DomainAdminBulk')
  return { default: module.default }
})

export function CoreOperationsAdminLazyGate({
  enabled,
  adminProps,
}: {
  enabled: boolean
  adminProps: OperationsAdminBulkProps
}) {
  if (!enabled) {
    return null
  }

  return (
    <Suspense fallback={<p className="clear-copy">Loading operations admin...</p>}>
      <LazyOperationsAdminBulk {...adminProps} />
    </Suspense>
  )
}

export function DomainAdminLazyGate({
  enabled,
  adminProps,
}: {
  enabled: boolean
  adminProps: DomainAdminBulkProps
}) {
  if (!enabled) {
    return null
  }

  return (
    <Suspense fallback={<p className="clear-copy">Loading domain admin panels...</p>}>
      <LazyDomainAdminBulk {...adminProps} />
    </Suspense>
  )
}
