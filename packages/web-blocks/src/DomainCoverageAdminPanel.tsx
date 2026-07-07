import type { ReactNode } from 'react'
import { AdminRefreshButton } from './AdminRefreshButton.js'
import { BillingAdminPanel, type BillingAdminStatProps } from './BillingAdminPanel.js'
import {
  DomainCoverageRecordsList,
  type DomainCoverageRecord,
} from './DomainCoverageRecordsList.js'

export type DomainCoverageAdminPanelProps = {
  title: string
  panelClassName: string
  listClassName: string
  cardClassName: string
  role: string
  guidance: string
  stats: BillingAdminStatProps[]
  records: DomainCoverageRecord[]
  availableActions: string[]
  refreshAction: string
  actionBusy: boolean
  formatDomain: (domain: string) => string
  formatAdminAction: (action: string) => string
  onRefresh: () => void
  footer?: ReactNode
}

export function DomainCoverageAdminPanel({
  title,
  panelClassName,
  listClassName,
  cardClassName,
  role,
  guidance,
  stats,
  records,
  availableActions,
  refreshAction,
  actionBusy,
  formatDomain,
  formatAdminAction,
  onRefresh,
  footer,
}: DomainCoverageAdminPanelProps) {
  return (
    <BillingAdminPanel
      title={title}
      panelClassName={panelClassName}
      role={role}
      guidance={guidance}
      stats={stats}
    >
      <DomainCoverageRecordsList
        records={records}
        listClassName={listClassName}
        cardClassName={cardClassName}
        formatDomain={formatDomain}
      />
      <AdminRefreshButton
        visible={availableActions.includes(refreshAction)}
        disabled={actionBusy}
        label={formatAdminAction(refreshAction)}
        onClick={onRefresh}
      />
      {footer}
    </BillingAdminPanel>
  )
}
