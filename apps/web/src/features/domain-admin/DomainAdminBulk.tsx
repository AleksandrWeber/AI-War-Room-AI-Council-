// @ts-nocheck
import { Suspense, lazy } from 'react'

export type DomainAdminBulkProps = Record<string, unknown>

const LazyPart1 = lazy(async () => {
  const module = await import('./DomainAdminBulkPart1')
  return { default: module.default }
})

const LazyPart2 = lazy(async () => {
  const module = await import('./DomainAdminBulkPart2')
  return { default: module.default }
})

const LazyPart3 = lazy(async () => {
  const module = await import('./DomainAdminBulkPart3')
  return { default: module.default }
})

const LazyPart4 = lazy(async () => {
  const module = await import('./DomainAdminBulkPart4')
  return { default: module.default }
})

export default function DomainAdminBulk(props: DomainAdminBulkProps) {
  return (
    <>
      <Suspense fallback={<p className="clear-copy">Loading domain admin group 1...</p>}>
        <LazyPart1 {...props} />
      </Suspense>
      <Suspense fallback={<p className="clear-copy">Loading domain admin group 2...</p>}>
        <LazyPart2 {...props} />
      </Suspense>
      <Suspense fallback={<p className="clear-copy">Loading domain admin group 3...</p>}>
        <LazyPart3 {...props} />
      </Suspense>
      <Suspense fallback={<p className="clear-copy">Loading domain admin group 4...</p>}>
        <LazyPart4 {...props} />
      </Suspense>
    </>
  )
}
