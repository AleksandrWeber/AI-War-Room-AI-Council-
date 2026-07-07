import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BillingAdminPanel } from './BillingAdminPanel.js'
import { DomainCoverageAdminPanel } from './DomainCoverageAdminPanel.js'

describe('BillingAdminPanel', () => {
  it('renders admin header and stats', () => {
    const html = renderToStaticMarkup(
      <BillingAdminPanel
        title="Backup admin"
        panelClassName="workspace-backup-admin"
        role="owner"
        guidance="Review backup coverage."
        stats={[
          { label: 'Records', value: 12, detail: '3 domains covered' },
        ]}
      />,
    )

    expect(html).toContain('Backup admin')
    expect(html).toContain('owner')
    expect(html).toContain('Records')
  })
})

describe('DomainCoverageAdminPanel', () => {
  it('renders records and refresh action', () => {
    const html = renderToStaticMarkup(
      <DomainCoverageAdminPanel
        title="Backup admin"
        panelClassName="workspace-backup-admin"
        listClassName="workspace-backup-list"
        cardClassName="workspace-backup-card"
        role="owner"
        guidance="Review backup coverage."
        stats={[{ label: 'Records', value: 1, detail: '1/1 domains covered' }]}
        records={[
          {
            domain: 'runs',
            tableName: 'runs',
            tableExists: true,
            recordCount: 4,
          },
        ]}
        availableActions={['refresh_backup_summary']}
        refreshAction="refresh_backup_summary"
        actionBusy={false}
        formatDomain={(domain) => domain}
        formatAdminAction={(action) => action}
        onRefresh={() => undefined}
      />,
    )

    expect(html).toContain('workspace-backup-list')
    expect(html).toContain('refresh_backup_summary')
    expect(html).toContain('runs')
  })
})
