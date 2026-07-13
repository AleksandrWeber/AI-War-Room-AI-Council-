import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { WorkspaceAdminPanels } from './WorkspaceAdminPanels.js'

const settingsSummary = {
  role: 'owner',
  guidance: 'Manage workspace settings.',
  settings: {
    workspaceId: 'local_workspace',
    name: 'Local workspace',
    shieldDisplaySensitivity: 'medium_and_up',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  availableActions: ['update_workspace_name', 'update_shield_display_sensitivity'],
} as const

describe('WorkspaceAdminPanels', () => {
  it('renders settings panel in settings mode', () => {
    const html = renderToStaticMarkup(
      <WorkspaceAdminPanels
        mode="settings"
        settingsAdminSummary={settingsSummary}
        memberAdminSummary={null}
        workspaceNameDraft="Local workspace"
        settingsAdminAction="idle"
        newMemberForm={{ userId: '', role: 'member', email: '' }}
        memberAdminAction="idle"
        billingAction="idle"
        inviteForm={{ email: '', role: 'member' }}
        inviteAction="idle"
        invites={[]}
        latestInviteUrl={null}
        onWorkspaceNameDraftChange={() => undefined}
        onUpdateWorkspaceName={() => undefined}
        onResetWorkspaceName={() => undefined}
        onUpdateShieldDisplaySensitivity={() => undefined}
        onNewMemberFormChange={() => undefined}
        onInviteFormChange={() => undefined}
        onCreateInvite={() => undefined}
        onRevokeInvite={() => undefined}
        onCopyInviteLink={() => undefined}
        onMemberAdminAction={() => undefined}
        onExportAudit={() => undefined}
      />,
    )

    expect(html).toContain('Workspace settings admin')
    expect(html).not.toContain('Member admin tools')
  })
})
