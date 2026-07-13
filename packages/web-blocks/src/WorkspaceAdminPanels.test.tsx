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
        inviteForm={{ email: '', role: 'member', expiresInHours: 168 }}
        inviteAction="idle"
        invites={[]}
        latestInviteUrl={null}
        inviteUrlsById={{}}
        canLeaveWorkspace={false}
        onWorkspaceNameDraftChange={() => undefined}
        onUpdateWorkspaceName={() => undefined}
        onResetWorkspaceName={() => undefined}
        onUpdateShieldDisplaySensitivity={() => undefined}
        onNewMemberFormChange={() => undefined}
        onInviteFormChange={() => undefined}
        onCreateInvite={() => undefined}
        onRevokeInvite={() => undefined}
        onResendInvite={() => undefined}
        onCopyInviteLink={() => undefined}
        onLeaveWorkspace={() => undefined}
        onMemberAdminAction={() => undefined}
        onExportAudit={() => undefined}
      />,
    )

    expect(html).toContain('Workspace settings admin')
    expect(html).not.toContain('Member admin tools')
  })

  it('renders Make owner for non-owner members', () => {
    const html = renderToStaticMarkup(
      <WorkspaceAdminPanels
        mode="member"
        settingsAdminSummary={null}
        memberAdminSummary={{
          workspaceId: 'local_workspace',
          role: 'owner',
          guidance: 'Manage members.',
          stats: { memberCount: 2, ownerCount: 1, adminCount: 0 },
          members: [
            {
              userId: 'user_owner',
              role: 'owner',
              email: 'owner@example.com',
              displayName: 'Owner',
            },
            {
              userId: 'user_member',
              role: 'member',
              email: 'member@example.com',
              displayName: 'Member',
            },
          ],
          availableActions: ['update_member_role', 'remove_member', 'add_member'],
        }}
        workspaceNameDraft="Local workspace"
        settingsAdminAction="idle"
        newMemberForm={{ userId: '', role: 'member', email: '' }}
        memberAdminAction="idle"
        billingAction="idle"
        inviteForm={{ email: '', role: 'member', expiresInHours: 168 }}
        inviteAction="idle"
        invites={[]}
        latestInviteUrl={null}
        inviteUrlsById={{}}
        canLeaveWorkspace={false}
        onWorkspaceNameDraftChange={() => undefined}
        onUpdateWorkspaceName={() => undefined}
        onResetWorkspaceName={() => undefined}
        onUpdateShieldDisplaySensitivity={() => undefined}
        onNewMemberFormChange={() => undefined}
        onInviteFormChange={() => undefined}
        onCreateInvite={() => undefined}
        onRevokeInvite={() => undefined}
        onResendInvite={() => undefined}
        onCopyInviteLink={() => undefined}
        onLeaveWorkspace={() => undefined}
        onMemberAdminAction={() => undefined}
        onExportAudit={() => undefined}
      />,
    )

    expect(html).toContain('Make owner')
    expect(html).toContain('Promote another member to owner')
  })

  it('renders demote Make admin for co-owners', () => {
    const html = renderToStaticMarkup(
      <WorkspaceAdminPanels
        mode="member"
        settingsAdminSummary={null}
        memberAdminSummary={{
          workspaceId: 'local_workspace',
          role: 'owner',
          guidance: 'Manage members.',
          stats: { memberCount: 2, ownerCount: 2, adminCount: 0 },
          members: [
            {
              userId: 'user_owner',
              role: 'owner',
              email: 'owner@example.com',
              displayName: 'Owner',
            },
            {
              userId: 'user_co_owner',
              role: 'owner',
              email: 'co@example.com',
              displayName: 'Co Owner',
            },
          ],
          availableActions: ['update_member_role', 'remove_member', 'add_member'],
        }}
        workspaceNameDraft="Local workspace"
        settingsAdminAction="idle"
        newMemberForm={{ userId: '', role: 'member', email: '' }}
        memberAdminAction="idle"
        billingAction="idle"
        inviteForm={{ email: '', role: 'member', expiresInHours: 168 }}
        inviteAction="idle"
        invites={[]}
        latestInviteUrl={null}
        inviteUrlsById={{}}
        canLeaveWorkspace={true}
        onWorkspaceNameDraftChange={() => undefined}
        onUpdateWorkspaceName={() => undefined}
        onResetWorkspaceName={() => undefined}
        onUpdateShieldDisplaySensitivity={() => undefined}
        onNewMemberFormChange={() => undefined}
        onInviteFormChange={() => undefined}
        onCreateInvite={() => undefined}
        onRevokeInvite={() => undefined}
        onResendInvite={() => undefined}
        onCopyInviteLink={() => undefined}
        onLeaveWorkspace={() => undefined}
        onMemberAdminAction={() => undefined}
        onExportAudit={() => undefined}
      />,
    )

    expect(html).toContain('data-testid="demote-owner"')
  })
})
