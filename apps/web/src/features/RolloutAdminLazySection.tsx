import { Suspense, lazy, type ReactNode } from 'react'
import type { WorkspaceAdminPanelsProps } from '@ai-war-room/web-blocks'

const LazyWorkspaceAdminPanels = lazy(async () => {
  const module = await import('@ai-war-room/web-blocks')
  return { default: module.WorkspaceAdminPanels }
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

export function RolloutAdminLazyGate({
  enabled,
  children,
}: {
  enabled: boolean
  children: ReactNode
}) {
  if (!enabled) {
    return null
  }

  return (
    <Suspense fallback={<p className="clear-copy">Loading rollout controls...</p>}>
      {children}
    </Suspense>
  )
}
