import { Suspense, lazy } from 'react'
import type { UsageAdminLazyPanelProps } from './usage-admin/UsageAdminLazyPanel'

const LazyUsageAdminPanel = lazy(async () => {
  const module = await import('./usage-admin/UsageAdminLazyPanel')
  return { default: module.default }
})

export type UsageAdminLazySectionProps = {
  enabled: boolean
} & UsageAdminLazyPanelProps

export function UsageAdminLazySection({
  enabled,
  ...panelProps
}: UsageAdminLazySectionProps) {
  if (!enabled) {
    return null
  }

  return (
    <Suspense fallback={<p className="clear-copy">Loading usage admin...</p>}>
      <LazyUsageAdminPanel {...panelProps} />
    </Suspense>
  )
}
