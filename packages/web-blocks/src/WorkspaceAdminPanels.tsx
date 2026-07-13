import type { WorkspaceMemberAdminSummaryResponse } from '@ai-war-room/schemas'
import type { WorkspaceSettingsAdminSummaryResponse } from '@ai-war-room/schemas'
import type { WorkspaceInviteRecord } from '@ai-war-room/schemas'
import {
  WorkspaceMemberAdminPanel,
  type WorkspaceInviteFormState,
  type WorkspaceMemberFormState,
} from './WorkspaceMemberAdminPanel.js'
import { WorkspaceSettingsAdminPanel } from './WorkspaceSettingsAdminPanel.js'

export type WorkspaceAdminPanelsProps = {
  settingsAdminSummary: WorkspaceSettingsAdminSummaryResponse | null
  memberAdminSummary: WorkspaceMemberAdminSummaryResponse | null
  workspaceNameDraft: string
  settingsAdminAction: 'idle' | 'running'
  newMemberForm: WorkspaceMemberFormState
  memberAdminAction: 'idle' | 'running'
  billingAction: 'idle' | 'loading' | 'upgrading' | 'portal' | 'canceling'
  inviteForm: WorkspaceInviteFormState
  inviteAction: 'idle' | 'running'
  invites: WorkspaceInviteRecord[]
  latestInviteUrl: string | null
  onWorkspaceNameDraftChange: (value: string) => void
  onUpdateWorkspaceName: (name: string) => void
  onResetWorkspaceName: () => void
  onUpdateShieldDisplaySensitivity: (
    sensitivity: 'high_only' | 'medium_and_up' | 'all',
  ) => void
  onNewMemberFormChange: (value: WorkspaceMemberFormState) => void
  onInviteFormChange: (value: WorkspaceInviteFormState) => void
  onCreateInvite: () => void
  onRevokeInvite: (inviteId: string) => void
  onCopyInviteLink: () => void
  onMemberAdminAction: (input: {
    action: 'update_member_role' | 'remove_member' | 'add_member'
    userId: string
    role?: WorkspaceMemberFormState['role']
    email?: string
  }) => void
  onExportAudit: (format: 'csv' | 'json') => void
}

export function WorkspaceAdminPanels({
  settingsAdminSummary,
  memberAdminSummary,
  workspaceNameDraft,
  settingsAdminAction,
  newMemberForm,
  memberAdminAction,
  billingAction,
  inviteForm,
  inviteAction,
  invites,
  latestInviteUrl,
  onWorkspaceNameDraftChange,
  onUpdateWorkspaceName,
  onResetWorkspaceName,
  onUpdateShieldDisplaySensitivity,
  onNewMemberFormChange,
  onInviteFormChange,
  onCreateInvite,
  onRevokeInvite,
  onCopyInviteLink,
  onMemberAdminAction,
  onExportAudit,
  mode = 'all',
}: WorkspaceAdminPanelsProps & {
  mode?: 'all' | 'settings' | 'member'
}) {
  return (
    <>
      {(mode === 'all' || mode === 'settings') && settingsAdminSummary ? (
        <WorkspaceSettingsAdminPanel
          summary={settingsAdminSummary}
          workspaceNameDraft={workspaceNameDraft}
          settingsAdminAction={settingsAdminAction}
          onWorkspaceNameDraftChange={onWorkspaceNameDraftChange}
          onUpdateWorkspaceName={onUpdateWorkspaceName}
          onResetWorkspaceName={onResetWorkspaceName}
          onUpdateShieldDisplaySensitivity={onUpdateShieldDisplaySensitivity}
        />
      ) : null}
      {(mode === 'all' || mode === 'member') && memberAdminSummary ? (
        <WorkspaceMemberAdminPanel
          summary={memberAdminSummary}
          newMemberForm={newMemberForm}
          memberAdminAction={memberAdminAction}
          billingAction={billingAction}
          inviteForm={inviteForm}
          inviteAction={inviteAction}
          invites={invites}
          latestInviteUrl={latestInviteUrl}
          onNewMemberFormChange={onNewMemberFormChange}
          onInviteFormChange={onInviteFormChange}
          onCreateInvite={onCreateInvite}
          onRevokeInvite={onRevokeInvite}
          onCopyInviteLink={onCopyInviteLink}
          onMemberAdminAction={onMemberAdminAction}
          onExportAudit={onExportAudit}
        />
      ) : null}
    </>
  )
}
