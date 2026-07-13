import { Suspense, lazy } from 'react'
import type {
  BillingWorkspacePanelProps,
  WorkspaceAdminPanelsProps,
} from '@ai-war-room/web-blocks'
import type { RolloutAdminBulkProps } from './rollout-admin/RolloutAdminBulk'

const LazyWorkspaceAdminPanels = lazy(async () => {
  const module = await import('@ai-war-room/web-blocks')
  return { default: module.WorkspaceAdminPanels }
})

const LazyBillingWorkspacePanel = lazy(async () => {
  const module = await import('@ai-war-room/web-blocks')
  return { default: module.BillingWorkspacePanel }
})

const LazyRolloutAdminBulk = lazy(async () => {
  const module = await import('./rollout-admin/RolloutAdminBulk')
  return { default: module.default }
})

export function WorkspaceAdminLazySection(
  props: WorkspaceAdminPanelsProps & {
    mode?: 'all' | 'settings' | 'member'
  },
) {
  return (
    <Suspense fallback={<p className="clear-copy">Loading workspace admin...</p>}>
      <LazyWorkspaceAdminPanels {...props} />
    </Suspense>
  )
}

export function BillingWorkspaceLazySection(props: BillingWorkspacePanelProps) {
  return (
    <Suspense fallback={<p className="clear-copy">Loading billing...</p>}>
      <LazyBillingWorkspacePanel {...props} />
    </Suspense>
  )
}

export function RolloutAdminLazyGate({
  enabled,
  rolloutProps,
}: {
  enabled: boolean
  rolloutProps: RolloutAdminBulkProps
}) {
  if (!enabled) {
    return null
  }

  return (
    <Suspense fallback={<p className="clear-copy">Loading rollout controls...</p>}>
      <LazyRolloutAdminBulk {...rolloutProps} />
    </Suspense>
  )
}
